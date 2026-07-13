"use client"

import { CheckCircle2, Circle, Loader2, ShieldCheck, Zap } from "lucide-react"

type MilestoneStatus = "done" | "active" | "upcoming"

interface Phase {
  title: string
  status: MilestoneStatus
  timeframe: string
  items: string[]
}

const PHASES: Phase[] = [
  {
    title: "Foundation",
    status: "done",
    timeframe: "Completed",
    items: ["Assembled the core development team", "Built the on-chain betting engine", "Shipped the Oddiq platform"],
  },
  {
    title: "Game Development",
    status: "done",
    timeframe: "Completed",
    items: [
      "Launched 5 Originals: Coinflip, Dice, Colours, Limbo, Plinko",
      "Migrated the platform to Robinhood Chain",
      "Shipped the provably fair verification system",
    ],
  },
  {
    title: "Token Launch",
    status: "active",
    timeframe: "In progress",
    items: [
      "Launch the $ODDIQ token",
      "100% of supply released at launch — no team vesting cliff",
      "Platform fees routed into $ODDIQ buy-pressure",
    ],
  },
  {
    title: "Ecosystem Expansion",
    status: "upcoming",
    timeframe: "Planned",
    items: [
      "5 additional Originals",
      "VIP tier progression tracking and automated cashback",
      "Public affiliate dashboard with real-time commission tracking",
    ],
  },
]

const STATUS_META: Record<MilestoneStatus, { label: string; badge: string; icon: typeof CheckCircle2 }> = {
  done: { label: "Completed", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  active: { label: "In Progress", badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: Loader2 },
  upcoming: { label: "Planned", badge: "bg-white/10 text-white/50 border-white/20", icon: Circle },
}

const PROGRESS_PERCENT = 62

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="fixed inset-0 -z-10 bg-[#0c0b16]" />

      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Oddiq Roadmap</h1>
        <p className="text-white/60">Where the platform has been, and where it's headed next</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Provably Fair
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            <Zap className="h-3.5 w-3.5" /> Non-Custodial
          </span>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-10 rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-white">Overall Progress</span>
          <span className="font-bold text-yellow-400">{PROGRESS_PERCENT}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"
            style={{ width: `${PROGRESS_PERCENT}%` }}
          />
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="relative pl-10">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/10" />

        <div className="space-y-8">
          {PHASES.map((phase, i) => {
            const meta = STATUS_META[phase.status]
            const StatusIcon = meta.icon
            return (
              <div key={phase.title} className="relative">
                <div
                  className={`absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    phase.status === "done"
                      ? "border-emerald-500 bg-emerald-500/20"
                      : phase.status === "active"
                        ? "border-yellow-500 bg-yellow-500/20"
                        : "border-white/20 bg-white/5"
                  }`}
                >
                  <StatusIcon
                    className={`h-4 w-4 ${
                      phase.status === "done"
                        ? "text-emerald-400"
                        : phase.status === "active"
                          ? "animate-spin text-yellow-400"
                          : "text-white/40"
                    }`}
                  />
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-white">
                      Phase {i + 1}: {phase.title}
                    </h3>
                    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Follow the Journey</h2>
        <p className="mb-4 text-sm text-white/60">Get roadmap updates and community announcements on X.</p>
        <a
          href="https://x.com/oddiqdotfun"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-6 py-2.5 text-sm font-bold text-black hover:bg-yellow-300"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
          Follow on X
        </a>
      </div>
    </div>
  )
}
