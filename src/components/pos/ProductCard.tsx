interface ProductCardProps {
  name: string;
  category: string;
  price: string;
  image: string;
  outOfStock?: boolean;
  isBestSeller?: boolean;
  onClick?: () => void;
}

export function ProductCard({ name, category, price, image, outOfStock, isBestSeller, onClick }: ProductCardProps) {
  if (outOfStock) {
    return (
      <button disabled className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm transition-all text-left border border-line group cursor-not-allowed">
        <div className="h-[104px] overflow-hidden relative grayscale opacity-60">
          <img alt={name} className="w-full h-full object-cover" src={image}/>
          <div className="absolute inset-0 bg-coffee/20 flex items-center justify-center">
            <span className="bg-coffee/80 backdrop-blur-md text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">Hết hàng</span>
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
