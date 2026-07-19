import { Trash2 } from 'lucide-react';

export interface CartItemToppingType {
  toppingId: string;
  quantity: number;
  extraPrice: number;
  name: string;
}

interface CartItemProps {
  id: string;
  name: string;
  note: string;
  price: string;
  quantity: number;
  toppings?: CartItemToppingType[];
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  onCustomize?: () => void;
}

export function CartItem({ 
  name, 
  note, 
  price, 
  quantity, 
  toppings = [],
  onIncrease, 
  onDecrease, 
  onRemove,
  onCustomize
}: CartItemProps) {
  return (
    <>
      <div className="group">
        <div className="flex justify-between items-start mb-1.5">
          <div>
            <h4 className="font-bold text-coffee text-sm">{name}</h4>
            {note && <p className="text-[10px] text-muted italic">{note}</p>}
            {toppings.length > 0 && (
              <div className="text-[10px] text-muted mt-1 space-y-0.5">
                {toppings.map((t) => (
                  <div key={t.toppingId} className="flex items-center gap-1 leading-none">
                    <span className="text-latte">•</span>
                    <span>{t.name}</span>
                    <span>(+{t.extraPrice.toLocaleString('vi-VN')}đ)</span>
                    <span className="font-bold">x{t.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="font-bold text-coffee text-sm">{price}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              className="w-8 h-8 rounded-lg border border-line flex items-center justify-center text-coffee hover:bg-cream active:scale-90 transition-all font-bold text-sm"
              onClick={onDecrease}
            >-</button>
            <span className="font-bold w-5 text-center text-sm text-coffee">{quantity}</span>
            <button
              className="w-8 h-8 rounded-lg border border-line flex items-center justify-center text-coffee hover:bg-cream active:scale-90 transition-all font-bold text-sm"
              onClick={onIncrease}
            >+</button>
            <button
              className="ml-1.5 text-red-600 hover:text-red-800"
              onClick={onRemove}
              aria-label="Xóa món"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={onCustomize}
            className="text-[10px] text-latte font-bold hover:underline h-8 px-2 flex items-center"
          >
            Ghi chú
          </button>
        </div>
      </div>
      <div className="h-px bg-line/50"></div>
    </>
  );
}
