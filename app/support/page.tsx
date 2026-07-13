"use client"

import { LifeBuoy } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
  {
    q: "How do bets work on Oddiq?",
    a: "You send ETH directly from your wallet to the house wallet on Robinhood Chain. Oddiq never holds a custodial balance — every bet is an on-chain transaction, and winning payouts are sent back to your wallet automatically.",
  },
  {
    q: "How is fairness guaranteed?",
    a: "Every outcome is derived from a server-committed seed combined with your bet's own transaction hash, using HMAC-SHA256. See the Provably Fair page for the full explanation and a self-verification tool.",
  },
  {
    q: "Why did my payout fail?",
    a: "Payouts can fail if the house wallet's balance or the RPC endpoint is temporarily unavailable. Your win is recorded — contact support with your bet transaction hash and it will be resolved.",
  },
  {
    q: "What network do I need to be on?",
    a: "Robinhood Chain Mainnet. Connecting your wallet will prompt you to switch or add the network automatically.",
  },
]

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="fixed inset-0 -z-10 bg-[#0c0b16]" />
      <div className="mb-6 flex items-center gap-3">
        <LifeBuoy className="h-8 w-8 text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Help Center</h1>
          <p className="text-sm text-white/60">Common questions about betting on Oddiq</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-2">
        <Accordion type="single" collapsible>
          {FAQS.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`} className="border-white/10 px-3">
              <AccordionTrigger className="text-left text-sm font-semibold text-white hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-white/60">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 text-center">
        <p className="text-sm text-white/70">Still need help? Reach out on X.</p>
        <a
          href="https://x.com/oddiqdotfun"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-semibold text-yellow-300 hover:text-yellow-200"
        >
          @oddiqdotfun
        </a>
      </div>
    </div>
  )
}
