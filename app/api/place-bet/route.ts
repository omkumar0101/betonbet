import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"
import { getWorkingProvider } from "@/lib/wallet-config"
import { getVerifiedHouseWalletAddress, sendPayout } from "@/lib/house-wallet"
import { fairFloat, getServerSeedCommitment } from "@/lib/fairness"
import { getBetEntry, reserveBet, resolveBet, clearPendingBet } from "@/lib/bet-ledger"
import { COLOURS, type ColourChoice } from "@/lib/colors-config"
import { checkDiceWin, type DiceChoice } from "@/lib/dice-config"
import { MAX_GENERATED_MULTIPLIER, MIN_TARGET_MULTIPLIER, MAX_TARGET_MULTIPLIER } from "@/lib/limbo-config"
import { BOARD_ROWS, BOARD_WIDTH, MULTIPLIERS } from "@/lib/plinko-config"

export const dynamic = "force-dynamic"

const MIN_BET_AMOUNT = 0.0004
const WINNING_MULTIPLIER = 2.0
const HOUSE_EDGE = 0.01 // used only for Limbo's crash-point curve; other games keep their existing payout tables
const GAME_TYPES = ["coinflip", "dice", "colours", "limbo", "plinko"] as const
type GameType = (typeof GAME_TYPES)[number]

function isValidTxHash(value: unknown): value is string {
  return typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value)
}

async function verifyBetTransaction(txHash: string, playerAddress: string, betAmount: number) {
  const houseAddress = getVerifiedHouseWalletAddress()
  if (!houseAddress) {
    return { ok: false as const, error: "House wallet is not configured" }
  }

  const provider = await getWorkingProvider()

  const tx = await provider.getTransaction(txHash)
  if (!tx) return { ok: false as const, error: "Bet transaction not found on-chain" }

  const receipt = await provider.getTransactionReceipt(txHash)
  if (!receipt || receipt.status !== 1) {
    return { ok: false as const, error: "Bet transaction is not confirmed" }
  }

  if (!tx.to || tx.to.toLowerCase() !== houseAddress.toLowerCase()) {
    return { ok: false as const, error: "Bet transaction was not sent to the house wallet" }
  }

  if (!tx.from || tx.from.toLowerCase() !== playerAddress.toLowerCase()) {
    return { ok: false as const, error: "Bet transaction sender does not match player address" }
  }

  const expectedWei = ethers.parseEther(betAmount.toString())
  if (tx.value !== expectedWei) {
    return { ok: false as const, error: "Bet transaction value does not match claimed bet amount" }
  }

  return { ok: true as const }
}

export async function GET() {
  return NextResponse.json({ success: true, ...getServerSeedCommitment() })
}

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const { gameType, playerAddress, txHash, betAmount, clientSeed, choice, targetMultiplier } = body ?? {}

  if (!GAME_TYPES.includes(gameType)) {
    return NextResponse.json({ success: false, error: "Invalid game type" }, { status: 400 })
  }
  if (typeof playerAddress !== "string" || !ethers.isAddress(playerAddress)) {
    return NextResponse.json({ success: false, error: "Invalid player address" }, { status: 400 })
  }
  if (!isValidTxHash(txHash)) {
    return NextResponse.json({ success: false, error: "Invalid bet transaction hash" }, { status: 400 })
  }
  if (typeof betAmount !== "number" || !Number.isFinite(betAmount) || betAmount < MIN_BET_AMOUNT) {
    return NextResponse.json({ success: false, error: "Invalid bet amount" }, { status: 400 })
  }

  // Idempotent replay: if this bet was already resolved, return the stored result.
  const existing = getBetEntry(txHash)
  if (existing) {
    if (existing.status === "pending") {
      return NextResponse.json({ success: false, error: "This bet is already being processed" }, { status: 409 })
    }
    return NextResponse.json({ success: true, cached: true, ...serializeEntry(existing) })
  }

  const reserved = reserveBet(txHash, gameType, playerAddress, betAmount)
  if (!reserved) {
    return NextResponse.json({ success: false, error: "This bet is already being processed" }, { status: 409 })
  }

  try {
    const verification = await verifyBetTransaction(txHash, playerAddress, betAmount)
    if (!verification.ok) {
      clearPendingBet(txHash)
      return NextResponse.json({ success: false, error: verification.error }, { status: 400 })
    }

    const seed = typeof clientSeed === "string" && clientSeed.length > 0 ? clientSeed : "default"
    const outcome = computeOutcome(gameType as GameType, { seed, txHash, betAmount, choice, targetMultiplier })

    if (outcome.error) {
      clearPendingBet(txHash)
      return NextResponse.json({ success: false, error: outcome.error }, { status: 400 })
    }

    let payoutTxHash: string | null = null
    let payoutError: string | null = null

    if (outcome.won && outcome.payout > 0) {
      try {
        payoutTxHash = await sendPayout(playerAddress, outcome.payout)
      } catch (err) {
        payoutError = err instanceof Error ? err.message : "Payout transaction failed"
      }
    }

    resolveBet(txHash, {
      gameType,
      playerAddress,
      betAmount,
      won: outcome.won,
      payout: outcome.payout,
      payoutTxHash,
      payoutError,
      visual: outcome.visual,
    })

    const entry = getBetEntry(txHash)!
    return NextResponse.json({ success: true, ...serializeEntry(entry), serverSeedHash: getServerSeedCommitment().serverSeedHash })
  } catch (error) {
    clearPendingBet(txHash)
    const message = error instanceof Error ? error.message : "Failed to process bet"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

function serializeEntry(entry: NonNullable<ReturnType<typeof getBetEntry>>) {
  return {
    won: entry.won,
    payout: entry.payout,
    payoutTxHash: entry.payoutTxHash,
    payoutError: entry.payoutError,
    visual: entry.visual,
  }
}

function computeOutcome(
  gameType: GameType,
  params: { seed: string; txHash: string; betAmount: number; choice?: unknown; targetMultiplier?: unknown },
): { won: boolean; payout: number; visual: Record<string, unknown>; error?: string } {
  const { seed, txHash, betAmount } = params

  switch (gameType) {
    case "coinflip": {
      const choice = params.choice
      if (choice !== "heads" && choice !== "tails") {
        return { won: false, payout: 0, visual: {}, error: "Invalid coin side" }
      }
      const f = fairFloat(seed, txHash, 0)
      const actualResult: "heads" | "tails" = f < 0.5 ? "heads" : "tails"
      const won = actualResult === choice
      return {
        won,
        payout: won ? betAmount * WINNING_MULTIPLIER : 0,
        visual: { actualResult },
      }
    }

    case "dice": {
      const choice = params.choice as DiceChoice
      if (choice !== "less" && choice !== "more") {
        return { won: false, payout: 0, visual: {}, error: "Invalid dice choice" }
      }
      const dice1 = Math.floor(fairFloat(seed, txHash, 0) * 6) + 1
      const dice2 = Math.floor(fairFloat(seed, txHash, 1) * 6) + 1
      const total = dice1 + dice2
      const won = checkDiceWin(choice, total)
      return {
        won,
        payout: won ? betAmount * WINNING_MULTIPLIER : 0,
        visual: { dice1, dice2, total },
      }
    }

    case "colours": {
      const choice = params.choice as ColourChoice
      if (!COLOURS.some((c) => c.name === choice)) {
        return { won: false, payout: 0, visual: {}, error: "Invalid colour choice" }
      }
      const f = fairFloat(seed, txHash, 0)
      const idx = Math.min(COLOURS.length - 1, Math.floor(f * COLOURS.length))
      const actualResult = COLOURS[idx].name
      const won = actualResult === choice
      return {
        won,
        payout: won ? betAmount * WINNING_MULTIPLIER : 0,
        visual: { actualResult },
      }
    }

    case "limbo": {
      const target = Number(params.targetMultiplier)
      if (!Number.isFinite(target) || target < MIN_TARGET_MULTIPLIER || target > MAX_TARGET_MULTIPLIER) {
        return { won: false, payout: 0, visual: {}, error: "Invalid target multiplier" }
      }
      const f = fairFloat(seed, txHash, 0)
      // Standard provably-fair crash-point curve with a small house edge.
      const rawCrash = (100 * (1 - HOUSE_EDGE)) / (1 - f)
      const actualMultiplier = Math.max(1.0, Math.min(MAX_GENERATED_MULTIPLIER, Math.floor(rawCrash) / 100))
      const won = actualMultiplier >= target
      return {
        won,
        payout: won ? betAmount * target : 0,
        visual: { actualMultiplier, targetMultiplier: target },
      }
    }

    case "plinko": {
      let position = Math.floor(BOARD_WIDTH / 2)
      const path: number[] = []
      for (let row = 0; row < BOARD_ROWS; row++) {
        path.push(position)
        const f = fairFloat(seed, txHash, row)
        const bounceRight = f > 0.5
        if (bounceRight && position < BOARD_WIDTH - 1) position += 1
        else if (!bounceRight && position > 0) position -= 1
      }
      const finalSlot = Math.max(0, Math.min(MULTIPLIERS.length - 1, Math.floor((position / BOARD_WIDTH) * MULTIPLIERS.length)))
      const multiplier = MULTIPLIERS[finalSlot]
      const won = multiplier > 1.0
      return {
        won,
        payout: won ? betAmount * multiplier : 0,
        visual: { path, finalSlot, multiplier },
      }
    }
  }
}
