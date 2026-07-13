import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, Dices } from "lucide-react"

const FOOTER_LINKS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Casino",
    links: [
      { label: "Originals", href: "/#games" },
      { label: "Coinflip", href: "/coinflip" },
      { label: "Dice", href: "/dice" },
      { label: "Limbo", href: "/limbo" },
      { label: "Plinko", href: "/plinko" },
    ],
  },
  {
    heading: "Rewards",
    links: [
      { label: "Promotions", href: "/promotions" },
      { label: "VIP Club", href: "/vip" },
      { label: "Affiliate", href: "/affiliate" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Provably Fair", href: "/provably-fair" },
      { label: "Help Center", href: "/support" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-black/40">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center">
              <Image src="/images/oddiq-logo.png" alt="OddQ" width={120} height={48} className="h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]" />
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/50">
              Non-custodial on-chain betting on Robinhood Chain. Bets settle directly to your wallet — Oddiq never
              holds your funds.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Provably fair, verifiable outcomes
            </div>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-bold uppercase tracking-wide text-white/40">{col.heading}</h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-yellow-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md border border-white/20 px-2 py-1 text-[11px] font-bold text-white/60">18+</span>
            <span className="text-[11px] text-white/40">
              Gamble responsibly. Betting involves risk — only wager what you can afford to lose.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/oddiqdotfun"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/50 hover:text-white"
            >
              X / Twitter
            </a>
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Dices className="h-3.5 w-3.5" /> Robinhood Chain
            </span>
          </div>
        </div>

        <p className="mt-4 text-[10px] text-white/30">
          © {new Date().getFullYear()} Oddiq. All bets are final once confirmed on-chain. Nothing on this site is
          financial advice.
        </p>
      </div>
    </footer>
  )
}
