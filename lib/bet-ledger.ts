// In-memory ledger keyed by bet transaction hash. Prevents the same on-chain
// bet from being redeemed for a payout more than once, and makes bet
// resolution idempotent (a client retry returns the original result instead
// of re-rolling or re-paying).
//
// NOTE: this lives in process memory only. It resets on server restart and
// isn't shared across serverless instances. For a production deployment this
// ledger needs to move to a real database / KV store so replay protection
// survives restarts and scales across instances.

export type BetLedgerEntry = {
  status: "pending" | "resolved"
  gameType: string
  playerAddress: string
  betAmount: number
  won: boolean
  payout: number
  payoutTxHash: string | null
  payoutError: string | null
  visual: Record<string, unknown>
  createdAt: number
}

const globalForLedger = globalThis as unknown as {
  __betLedger?: Map<string, BetLedgerEntry>
}

function getLedger(): Map<string, BetLedgerEntry> {
  if (!globalForLedger.__betLedger) {
    globalForLedger.__betLedger = new Map()
  }
  return globalForLedger.__betLedger
}

export function getBetEntry(txHash: string): BetLedgerEntry | undefined {
  return getLedger().get(txHash.toLowerCase())
}

export function reserveBet(txHash: string, gameType: string, playerAddress: string, betAmount: number): boolean {
  const ledger = getLedger()
  const key = txHash.toLowerCase()
  if (ledger.has(key)) return false
  ledger.set(key, {
    status: "pending",
    gameType,
    playerAddress,
    betAmount,
    won: false,
    payout: 0,
    payoutTxHash: null,
    payoutError: null,
    visual: {},
    createdAt: Date.now(),
  })
  return true
}

export function resolveBet(txHash: string, update: Partial<BetLedgerEntry>) {
  const ledger = getLedger()
  const key = txHash.toLowerCase()
  const existing = ledger.get(key)
  if (!existing) return
  ledger.set(key, { ...existing, ...update, status: "resolved" })
}

export function clearPendingBet(txHash: string) {
  const ledger = getLedger()
  const key = txHash.toLowerCase()
  const existing = ledger.get(key)
  if (existing && existing.status === "pending") {
    ledger.delete(key)
  }
}

export function getResolvedBets(): BetLedgerEntry[] {
  return Array.from(getLedger().values()).filter((entry) => entry.status === "resolved")
}

export function getLedgerStats() {
  const resolved = getResolvedBets()
  const totalBets = resolved.length
  const totalWagered = resolved.reduce((sum, b) => sum + b.betAmount, 0)
  const totalPaidOut = resolved.reduce((sum, b) => sum + (b.won ? b.payout : 0), 0)
  const biggestWin = resolved.reduce((max, b) => (b.won && b.payout > max ? b.payout : max), 0)
  return { totalBets, totalWagered, totalPaidOut, biggestWin }
}
