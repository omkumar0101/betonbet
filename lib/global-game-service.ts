// Client-side helper for the verified, provably-fair bet flow. The actual
// outcome and payout are always decided server-side in /api/place-bet, which
// independently checks the bet transaction on-chain before resolving it —
// nothing here can influence who wins.

export type GameType = "dice" | "colours" | "coinflip" | "plinko" | "limbo"

export interface PlaceBetParams {
  gameType: GameType
  playerAddress: string
  txHash: string
  betAmount: number
  choice?: string
  targetMultiplier?: number
}

export interface PlaceBetResult {
  success: boolean
  won: boolean
  payout: number
  payoutTxHash: string | null
  payoutError: string | null
  visual: Record<string, any>
  error?: string
}

const CLIENT_SEED_KEY = "oddiq_client_seed"

export function getClientSeed(): string {
  if (typeof window === "undefined") return "server"
  let seed = window.localStorage.getItem(CLIENT_SEED_KEY)
  if (!seed) {
    seed = crypto.randomUUID()
    window.localStorage.setItem(CLIENT_SEED_KEY, seed)
  }
  return seed
}

export async function placeBet(params: PlaceBetParams): Promise<PlaceBetResult> {
  const response = await fetch("/api/place-bet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, clientSeed: getClientSeed() }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to place bet")
  }

  return {
    success: true,
    won: data.won,
    payout: data.payout,
    payoutTxHash: data.payoutTxHash,
    payoutError: data.payoutError,
    visual: data.visual ?? {},
  }
}

export const playGlobalDiceGame = (playerAddress: string, txHash: string, betAmount: number, choice: string) =>
  placeBet({ gameType: "dice", playerAddress, txHash, betAmount, choice })

export const playGlobalColorsGame = (playerAddress: string, txHash: string, betAmount: number, choice: string) =>
  placeBet({ gameType: "colours", playerAddress, txHash, betAmount, choice })

export const playGlobalCoinflipGame = (playerAddress: string, txHash: string, betAmount: number, choice: string) =>
  placeBet({ gameType: "coinflip", playerAddress, txHash, betAmount, choice })

export const playGlobalPlinkoGame = (playerAddress: string, txHash: string, betAmount: number) =>
  placeBet({ gameType: "plinko", playerAddress, txHash, betAmount })

export const playGlobalLimboGame = (
  playerAddress: string,
  txHash: string,
  betAmount: number,
  targetMultiplier: number,
) => placeBet({ gameType: "limbo", playerAddress, txHash, betAmount, targetMultiplier })
