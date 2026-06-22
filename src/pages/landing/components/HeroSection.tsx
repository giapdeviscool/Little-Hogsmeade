import { ArrowRight } from 'lucide-react'
import { cn } from '../../../utils/cn'

export function HeroSection({
  hero,
  onPrimaryAction,
  onSecondaryAction,
  embedded,
}: {
  hero: { title: string; subtitle: string; image: string; ctaLabel: string; ctaHref: string }
  onPrimaryAction: () => void
  onSecondaryAction: () => void
  embedded: boolean
}) {
  return (
    <section
      id="landing-hero"
      className={cn(
        'relative flex min-h-[760px] items-center justify-center overflow-hidden bg-cover bg-center px-4 py-16 text-center md:min-h-[840px] md:px-6',
        embedded && 'min-h-[440px] md:min-h-[560px]',
      )}
      style={{ backgroundImage: `url('${hero.image}')` }}
    >
      <div className="absolute inset-0 bg-white/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/99 via-transparent to-coffee/10" />
      <div className="relative max-w-[1020px]">
        <h1 className="text-[44px] font-bold leading-[1.03] tracking-[-0.055em] text-coffee md:text-[68px]">
          {hero.title}
        </h1>
        <p className="mx-auto mt-6 max-w-[760px] text-[16px] font-medium leading-7 text-coffee/85 md:text-[20px] md:leading-8">
          {hero.subtitle}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onPrimaryAction} className="rounded-full bg-coffee px-7 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-[#3f2d20]">
            Khám phá thực đơn <ArrowRight className="ml-1 inline h-4 w-4" />
          </button>
          <button type="button" onClick={onSecondaryAction} className="rounded-full border border-coffee bg-white/75 px-7 py-3.5 text-sm font-bold text-coffee backdrop-blur transition hover:bg-white">
            Đặt bàn / Order
          </button>
          {hero.ctaHref !== '#landing-menu' && (
            <button type="button" onClick={onPrimaryAction} className="rounded-full border border-line bg-white/75 px-7 py-3.5 text-sm font-bold text-muted backdrop-blur transition hover:bg-white">
              {hero.ctaLabel}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
