interface ProductCardProps {
  name: string;
  category: string;
  price: string;
  image: string;
  isActive?: boolean;
  isAvailable?: boolean;
  isBestSeller?: boolean;
  onClick?: () => void;
}

export function ProductCard({ name, category, price, image, isActive = true, isAvailable = true, isBestSeller, onClick }: ProductCardProps) {
  if (!isActive || !isAvailable) {
    const message = !isActive ? "Không Hoạt động" : "Tạm thời hết hàng";
    const badgeColor = !isActive ? "bg-red-600/90 text-white" : "bg-amber-500/90 text-coffee";
    
    return (
      <button disabled className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm transition-all text-left border border-line group cursor-not-allowed">
        <div className="h-[104px] overflow-hidden relative">
          <img alt={name} className="w-full h-full object-cover grayscale opacity-60" src={image}/>
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className={`backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-center ${badgeColor}`}>
              {message}
            </span>
          </div>
        </div>
        <div className="p-3 flex flex-col justify-between flex-1 opacity-50">
          <h3 className="text-sm font-bold text-coffee mb-1 line-clamp-1">{name}</h3>
          <div className="flex justify-between items-center">
            <span className="text-muted text-[10px] uppercase tracking-wide font-medium">{category}</span>
            <span className="font-bold text-coffee text-xs">{price}</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button onClick={onClick} className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left border border-line group">
      <div className="relative h-[104px] overflow-hidden">
        <img alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={image}/>
        {isBestSeller && (
          <div className="absolute top-1.5 right-1.5 bg-gold text-coffee px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-sm">
            Best
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col justify-between flex-1">
        <h3 className="text-sm font-bold text-coffee mb-1 line-clamp-1">{name}</h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-muted text-[10px] uppercase tracking-wide font-medium truncate pr-1.5">{category}</span>
          <span className="font-bold text-coffee text-xs whitespace-nowrap">{price}</span>
        </div>
      </div>
    </button>
  );
}
