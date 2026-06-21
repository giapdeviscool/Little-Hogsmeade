import type { ReactNode } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '../../utils/cn'

type CmsEditorModalProps = {
  open: boolean
  title: string
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function CmsEditorModal({ open, title, onOpenChange, children }: CmsEditorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[90vh] w-[95vw] flex-col overflow-hidden rounded-[28px] border border-line bg-white p-0 shadow-[0_25px_70px_rgba(74,53,37,0.2)] sm:max-w-[1024px]',
        )}
      >
        <div className="shrink-0 border-b border-line px-6 py-5">
          <DialogHeader>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">CMS editor</p>
            <DialogTitle className="mt-1 text-[24px] font-bold">{title}</DialogTitle>
          </DialogHeader>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </DialogContent>
    </Dialog>
  )
}

