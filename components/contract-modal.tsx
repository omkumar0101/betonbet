"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText } from "lucide-react"

interface ContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContractModal({ open, onOpenChange }: ContractModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-4 sm:p-6 bg-black/95 backdrop-blur-xl border-white/20 text-white"
        style={{ borderRadius: "24px" }}
      >
        <DialogHeader className="pb-3 sm:pb-6">
          <DialogTitle className="text-xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <FileText className="h-5 w-5 sm:h-7 sm:w-7 text-yellow-400" />
            Contract Address
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center py-12 sm:py-16">
          <p className="text-2xl sm:text-4xl font-bold text-white/80 tracking-wider">Coming Soon ....</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
