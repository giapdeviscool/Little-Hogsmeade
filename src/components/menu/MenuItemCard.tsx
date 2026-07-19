import { useState } from "react"
import { X } from "lucide-react"
import type { PublicMenuItem } from "../../api/public-menu.api"

export function MenuItemCard({
  item,
  isTopSelling,
}: {
  item: PublicMenuItem
  isTopSelling?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(item.basePrice)

  return (
    <>
      <article 
        onClick={() => setIsOpen(true)}
        className="cursor-pointer overflow-hidden rounded-[22px] border border-line bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-hover"
      >
        <div className="aspect-[4/3] overflow-hidden bg-beige relative">
          {isTopSelling && (
            <div className="absolute left-2 top-2 z-10 rounded-full bg-gold px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-sm flex items-center gap-1">
              <span>⭐ Best Seller</span>
            </div>
          )}
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">🍽️</div>
          )}
          {((item.menuItemVariants && item.menuItemVariants.length > 0) || (item.menuItemToppingGroups && item.menuItemToppingGroups.length > 0)) && (
            <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
              Có tuỳ chọn
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[16px] font-bold leading-tight text-coffee">{item.name}</h3>
            <span className="shrink-0 font-bold text-coffee">{formattedPrice}</span>
          </div>
          {item.description && (
            <p className="mt-1.5 text-sm leading-6 text-muted line-clamp-2">{item.description}</p>
          )}
        </div>
      </article>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-coffee shadow backdrop-blur transition hover:bg-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-[16/9] w-full shrink-0 bg-beige">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl">🍽️</div>
              )}
            </div>
            
            <div className="overflow-y-auto p-6 scrollbar-none">
              <div className="mb-6">
                <h2 className="text-2xl font-bold leading-tight text-coffee">{item.name}</h2>
                <div className="mt-1 font-bold text-coffee">{formattedPrice}</div>
                {item.description && <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>}
              </div>

              {item.menuItemVariants && item.menuItemVariants.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Kích cỡ / Loại</h3>
                  <div className="space-y-2">
                    {item.menuItemVariants.map((v) => (
                      <div key={v.id} className="flex items-center justify-between rounded-xl border border-line p-3">
                        <span className="font-medium text-coffee">{v.name}</span>
                        <span className="text-sm font-semibold text-coffee">
                          {v.priceAdjustment > 0 ? "+" : ""}{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v.priceAdjustment)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.menuItemToppingGroups && item.menuItemToppingGroups.length > 0 && (
                <div className="space-y-6">
                  {item.menuItemToppingGroups.map((tg) => {
                    const group = tg.toppingGroup
                    return (
                      <div key={group.id}>
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
                          {group.name} 
                          {group.isRequired ? <span className="ml-1 text-red-500">*</span> : ""}
                        </h3>
                        <div className="space-y-2">
                          {group.toppings.map((t) => (
                            <div key={t.id} className="flex items-center justify-between rounded-xl border border-line p-3">
                              <span className="font-medium text-coffee">{t.name}</span>
                              <span className="text-sm font-semibold text-coffee">
                                {t.extraPrice > 0 ? `+${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(t.extraPrice)}` : "Miễn phí"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
