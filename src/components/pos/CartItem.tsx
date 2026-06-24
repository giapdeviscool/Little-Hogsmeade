import { Trash2 } from 'lucide-react';

interface CartItemProps {
  id: string;
  name: string;
  note: string;
  price: string;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export function CartItem({ name, note, price, quantity, onIncrease, onDecrease, onRemove }: CartItemProps) {
  return (
    <>
      <div className="group">
        <div className="flex justify-between items-start mb-1.5">
          <div>
            <h4 className="font-bold text-coffee text-sm">{name}</h4>
            <p className="text-[10px] text-muted italic">{note}</p>
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
          <button className="text-[10px] text-latte font-bold hover:underline h-8 px-2 flex items-center">Ghi chú</button>
        </div>
      </div>
      <div className="h-px bg-line/50"></div>
    </>
  );
}
