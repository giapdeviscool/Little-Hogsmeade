export function MenuItemCard({
  name,
  description,
  imageUrl,
  basePrice,
}: {
  name: string
  description?: string
  imageUrl?: string
  basePrice: number
}) {
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(basePrice)

  return (
    <article className="overflow-hidden rounded-[22px] border border-line bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-hover">
      <div className="aspect-[4/3] overflow-hidden bg-beige">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🍽️</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[16px] font-bold leading-tight text-coffee">{name}</h3>
          <span className="shrink-0 font-bold text-coffee">{formattedPrice}</span>
        </div>
        {description && (
          <p className="mt-1.5 text-sm leading-6 text-muted line-clamp-2">{description}</p>
        )}
      </div>
    </article>
  )
}
