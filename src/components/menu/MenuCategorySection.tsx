import type { PublicCategory, PublicMenuItem } from "../../api/public-menu.api"
import { MenuItemCard } from "./MenuItemCard"

export function MenuCategorySection({
  category,
  items,
  topSellingIds,
}: {
  category: PublicCategory
  items: PublicMenuItem[]
  topSellingIds?: Set<string>
}) {
  if (items.length === 0) return null

  return (
    <section id={`cat-${category.id}`} className="scroll-mt-24">
      <div className="mb-6 flex items-center gap-3">
        {category.icon && <span className="text-2xl leading-none">{category.icon}</span>}
        <h2 className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-coffee">
          {category.name}
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            isTopSelling={topSellingIds?.has(item.id)}
          />
        ))}
      </div>
    </section>
  )
}
