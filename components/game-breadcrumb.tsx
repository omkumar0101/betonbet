import Link from "next/link"
import { ChevronRight, ShieldCheck } from "lucide-react"

export function GameBreadcrumb({ game }: { game: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-xs text-white/50">
        <Link href="/" className="hover:text-white/80">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="hover:text-white/80">Originals</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-white/80">{game}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400">
        <ShieldCheck className="h-3 w-3" />
        Provably Fair
      </div>
    </div>
  )
}
