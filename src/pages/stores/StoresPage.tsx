import { useBranches } from './useBranches'
import { BranchCard } from './BranchCard'
import { MapPin, Search, Navigation } from 'lucide-react'

export function StoresPage() {
  const {
    branches,
    loading,
    error,
    query,
    setQuery,
    locationNotice,
    detectLocation,
  } = useBranches()

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1320px] px-4 py-16 md:px-8 md:py-24 lg:px-14">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.28em] text-gold">
              Hệ thống cửa hàng
            </span>
            <h1 className="mt-6 text-[36px] font-bold leading-[1.1] tracking-[-0.04em] text-coffee md:text-[48px]">
              Tìm chi nhánh Little Hogsmeade gần bạn
            </h1>
            <p className="mt-5 text-base leading-7 text-muted md:text-lg">
              Khám phá hệ thống chi nhánh và lựa chọn địa điểm thuận tiện nhất cho trải nghiệm của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="border-b border-line bg-white/60">
        <div className="mx-auto max-w-[1320px] px-4 py-6 md:px-8 lg:px-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên, địa chỉ, thành phố..."
                className="h-[52px] w-full rounded-full border border-line bg-white pl-12 pr-5 text-sm outline-none transition focus:border-coffee focus:ring-2 focus:ring-coffee/10"
              />
            </div>
            <button
              type="button"
              onClick={detectLocation}
              className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-full bg-coffee px-6 font-bold text-white transition hover:bg-opacity-90"
            >
              <Navigation className="h-4 w-4" />
              Dùng vị trí của tôi
            </button>
          </div>
          {locationNotice && (
            <div className="mt-4 rounded-[14px] border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800">
              {locationNotice}
            </div>
          )}
        </div>
      </section>

      {/* Branches Grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-[1320px] px-4 md:px-8 lg:px-14">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[280px] animate-pulse rounded-[18px] border border-line bg-white"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[18px] border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-sm font-semibold text-red-800">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full bg-coffee px-6 py-2.5 text-xs font-bold text-white transition hover:bg-opacity-90"
              >
                Thử lại
              </button>
            </div>
          ) : branches.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-latte bg-white/60 px-6 py-16 text-center">
              <MapPin className="mx-auto h-12 w-12 text-muted/40" />
              <p className="mt-4 text-base font-semibold text-muted">Không tìm thấy chi nhánh phù hợp.</p>
              <p className="mt-2 text-sm text-muted/80">Vui lòng thử từ khóa khác hoặc bật định vị để tìm chi nhánh gần nhất.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch) => (
                <BranchCard key={branch.id} branch={branch} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}