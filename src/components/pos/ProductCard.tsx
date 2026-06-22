interface ProductCardProps {
  name: string;
  category: string;
  price: string;
  image: string;
  outOfStock?: boolean;
  isBestSeller?: boolean;
}

export function ProductCard({ name, category, price, image, outOfStock, isBestSeller }: ProductCardProps) {
  if (outOfStock) {
    return (
      <button disabled className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm transition-all text-left border border-line group cursor-not-allowed">
        <div className="h-48 overflow-hidden relative grayscale opacity-60">
          <img alt={name} className="w-full h-full object-cover" src={image}/>
          <div className="absolute inset-0 bg-coffee/20 flex items-center justify-center">
            <span className="bg-coffee/80 backdrop-blur-md text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest">Hết hàng</span>
          </div>
        </div>
        <div className="p-5 flex flex-col justify-between flex-1 opacity-50">
          <h3 className="text-xl font-bold text-coffee mb-1">{name}</h3>
          <div className="flex justify-between items-center">
            <span className="text-muted text-xs uppercase tracking-wide font-medium">{category}</span>
            <span className="font-bold text-coffee">{price}</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left border border-line group">
      <div className="relative h-48 overflow-hidden">
        <img alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={image}/>
        {isBestSeller && (
          <div className="absolute top-3 right-3 bg-gold text-coffee px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
            Best Seller
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col justify-between flex-1">
        <h3 className="text-xl font-bold text-coffee mb-1">{name}</h3>
        <div className="flex justify-between items-center">
          <span className="text-muted text-xs uppercase tracking-wide font-medium">{category}</span>
          <span className="font-bold text-coffee">{price}</span>
        </div>
      </div>
    </button>
  );
}
