import { NextResponse } from "next/server"
import { getServerSeedCommitment, rotateServerSeed, getRevealedSeedHistory } from "@/lib/fairness"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    success: true,
    ...getServerSeedCommitment(),
    history: getRevealedSeedHistory(),
  })
}

export async function POST() {
  const result = rotateServerSeed()
  return NextResponse.json({ success: true, ...result })
}
