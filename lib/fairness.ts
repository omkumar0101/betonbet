import { createHash, createHmac, randomBytes } from "crypto"

// Provably-fair engine: server commits to a secret seed (publishes its hash up
// front), players can supply their own client seed, and every bet's outcome is
// HMAC-SHA256(serverSeed, `${clientSeed}:${txHash}:${cursor}`). Because the
// commitment is published before the bet, and the txHash is unique per bet and
// unknown until the player signs it, neither side can bias an individual
// result after the fact. Rotating the seed reveals the previous one so anyone
// can recompute every bet made under it and confirm the platform didn't cheat.

interface SeedState {
  seed: string
  hash: string
  activeSince: number
}

interface RevealedSeed extends SeedState {
  revealedAt: number
}

function generateSeed(): string {
  return randomBytes(32).toString("hex")
}

function hashSeed(seed: string): string {
  return createHash("sha256").update(seed).digest("hex")
}

const globalForFairness = globalThis as unknown as {
  __fairnessState?: SeedState
  __fairnessHistory?: RevealedSeed[]
}

function getState(): SeedState {
  if (!globalForFairness.__fairnessState) {
    const seed = generateSeed()
    globalForFairness.__fairnessState = { seed, hash: hashSeed(seed), activeSince: Date.now() }
  }
  return globalForFairness.__fairnessState
}

function getHistory(): RevealedSeed[] {
  if (!globalForFairness.__fairnessHistory) {
    globalForFairness.__fairnessHistory = []
  }
  return globalForFairness.__fairnessHistory
}

export function getServerSeedCommitment(): { serverSeedHash: string; activeSince: number } {
  const state = getState()
  return { serverSeedHash: state.hash, activeSince: state.activeSince }
}

export function rotateServerSeed(): { revealedSeed: string; revealedHash: string; newServerSeedHash: string } {
  const state = getState()
  const revealed: RevealedSeed = { ...state, revealedAt: Date.now() }
  getHistory().unshift(revealed)
  if (getHistory().length > 50) getHistory().length = 50

  const newSeed = generateSeed()
  globalForFairness.__fairnessState = { seed: newSeed, hash: hashSeed(newSeed), activeSince: Date.now() }

  return {
    revealedSeed: revealed.seed,
    revealedHash: revealed.hash,
    newServerSeedHash: globalForFairness.__fairnessState.hash,
  }
}

export function getRevealedSeedHistory() {
  return getHistory().map(({ seed, hash, activeSince, revealedAt }) => ({
    seed,
    hash,
    activeSince,
    revealedAt,
  }))
}

/** Deterministic float in [0, 1) derived from the current (secret) server seed. */
export function fairFloat(clientSeed: string, nonceMaterial: string, cursor: number): number {
  const state = getState()
  const hmac = createHmac("sha256", state.seed).update(`${clientSeed}:${nonceMaterial}:${cursor}`).digest("hex")
  return Number.parseInt(hmac.slice(0, 8), 16) / 0xffffffff
}

/** Recompute a float from an already-revealed server seed, for public verification. */
export function verifyFairFloat(revealedSeed: string, clientSeed: string, nonceMaterial: string, cursor: number): number {
  const hmac = createHmac("sha256", revealedSeed).update(`${clientSeed}:${nonceMaterial}:${cursor}`).digest("hex")
  return Number.parseInt(hmac.slice(0, 8), 16) / 0xffffffff
}
