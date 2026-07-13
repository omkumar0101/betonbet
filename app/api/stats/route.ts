import { NextResponse } from "next/server"
import { getLedgerStats } from "@/lib/bet-ledger"
import { getHouseWalletBalance } from "@/lib/house-wallet"

export const dynamic = "force-dynamic"

export async function GET() {
  const ledgerStats = getLedgerStats()
  const houseBalance = await getHouseWalletBalance()

  return NextResponse.json({
    success: true,
    houseBalance,
    ...ledgerStats,
  })
}
