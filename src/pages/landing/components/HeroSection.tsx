import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '../../../utils/cn'

type BannerProps = { title: string; subtitle: string; image: string; ctaLabel: string; ctaHref: string }

export function HeroSection({
  banners = [],
  fallbackHero,
  onPrimaryAction,
  onSecondaryAction,
  embedded,
  isFullBanner = false,
}: {
  banners?: BannerProps[]
  fallbackHero: BannerProps
  onPrimaryAction: () => void
  onSecondaryAction: () => void
  embedded: boolean
  isFullBanner?: boolean
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  useEffect(() => {
    if (!isFullBanner || banners.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isFullBanner, banners.length, currentIndex])

  useEffect(() => {
    if (!isFullBanner || banners.length <= 1) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullBanner, banners.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const minSwipeDistance = 50
    if (distance > minSwipeDistance) {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    } else if (distance < -minSwipeDistance) {
      setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
    }
  }

  const activeHero = isFullBanner && banners.length > 0 ? banners[currentIndex] : fallbackHero

  return (
    <section
      id="landing-hero"
      onTouchStart={isFullBanner ? handleTouchStart : undefined}
      onTouchMove={isFullBanner ? handleTouchMove : undefined}
      onTouchEnd={isFullBanner ? handleTouchEnd : undefined}
      className={cn(
        'group relative flex items-center justify-center overflow-hidden bg-cover bg-center px-4 py-16 text-center md:px-6 transition-all duration-700 ease-in-out',
        isFullBanner
          ? 'aspect-[4/3] md:aspect-video lg:aspect-[21/9] min-h-[320px]'
          : embedded
          ? 'min-h-[max(calc(100vh-80px),640px)] md:min-h-[max(calc(100vh-80px),840px)]'
          : 'min-h-[max(calc(100vh-80px),640px)] md:min-h-[max(calc(100vh-80px),840px)]',
        isFullBanner && 'cursor-pointer'
      )}
      style={{ backgroundImage: `url('${activeHero.image}')` }}
      onClick={() => {
        if (isFullBanner && activeHero.ctaHref) {
          if (activeHero.ctaHref.startsWith('#')) {
            document.querySelector(activeHero.ctaHref)?.scrollIntoView({ behavior: 'smooth' })
          } else {
            window.location.href = activeHero.ctaHref
          }
        }
      }}
    >
      {!isFullBanner && (
        <>
          <div className="absolute inset-0 bg-white/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/99 via-transparent to-coffee/10" />
          <div className="relative max-w-[1020px]">
            <h1 className="text-[44px] font-bold leading-[1.03] tracking-[-0.055em] text-coffee md:text-[68px] drop-shadow-sm">
              {activeHero.title}
            </h1>
            <p className="mx-auto mt-6 max-w-[760px] text-[16px] font-medium leading-7 text-coffee/85 md:text-[20px] md:leading-8 drop-shadow-sm">
              {activeHero.subtitle}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={(e) => { e.stopPropagation(); onPrimaryAction() }} className="rounded-full bg-coffee px-7 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-[#3f2d20]">
                Khám phá thực đơn <ArrowRight className="ml-1 inline h-4 w-4" />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); onSecondaryAction() }} className="rounded-full border border-coffee bg-white/75 px-7 py-3.5 text-sm font-bold text-coffee backdrop-blur transition hover:bg-white">
                Đặt bàn / Order
              </button>
              {activeHero.ctaHref !== '#landing-menu' && activeHero.ctaHref !== '/menu' && (
                <button type="button" onClick={(e) => {
                  e.stopPropagation();
                  if (activeHero.ctaHref.startsWith('#')) {
                    document.querySelector(activeHero.ctaHref)?.scrollIntoView({ behavior: 'smooth' })
                  } else {
                    window.location.href = activeHero.ctaHref
                  }
                }} className="rounded-full border border-line bg-white/75 px-7 py-3.5 text-sm font-bold text-muted backdrop-blur transition hover:bg-white">
                  {activeHero.ctaLabel || 'Xem thêm'}
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {isFullBanner && banners.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/50 p-2 text-coffee opacity-0 backdrop-blur transition hover:bg-white group-hover:opacity-100 md:left-8 md:p-3"
            onClick={(e) => {
              e.stopPropagation()
              setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/50 p-2 text-coffee opacity-0 backdrop-blur transition hover:bg-white group-hover:opacity-100 md:right-8 md:p-3"
            onClick={(e) => {
              e.stopPropagation()
              setCurrentIndex((prev) => (prev + 1) % banners.length)
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(idx)
                }}
                className={cn(
                  'h-2.5 rounded-full transition-all duration-300',
                  idx === currentIndex ? 'w-8 bg-coffee' : 'w-2.5 bg-coffee/40 hover:bg-coffee/60'
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
