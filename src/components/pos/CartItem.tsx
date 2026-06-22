interface CartItemProps {
  name: string;
  note: string;
  price: string;
  quantity: number;
}

export function CartItem({ name, note, price, quantity }: CartItemProps) {
  return (
    <>
      <div className="group">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-coffee">{name}</h4>
            <p className="text-xs text-muted italic">{note}</p>
          </div>
          <span className="font-bold text-coffee">{price}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-xl border border-line flex items-center justify-center text-coffee hover:bg-cream active:scale-90 transition-all font-bold">-</button>
            <span className="font-bold w-6 text-center text-lg text-coffee">{quantity}</span>
            <button className="w-10 h-10 rounded-xl border border-line flex items-center justify-center text-coffee hover:bg-cream active:scale-90 transition-all font-bold">+</button>
          </div>
          <button className="text-xs text-latte font-bold hover:underline h-10 px-3 flex items-center">Ghi chú</button>
        </div>
      </div>
      <div className="h-px bg-line/50"></div>
    </>
  );
}
