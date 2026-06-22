import { Save, FileText, Ban } from 'lucide-react';

export function CartSummary() {
  return (
    <div className="p-6 bg-cream border-t border-line mt-auto">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex justify-between text-sm text-muted font-medium">
          <span>Tạm tính</span>
          <span>220.000₫</span>
        </div>
        <div className="flex justify-between text-sm text-muted font-medium">
          <span>VAT (10%)</span>
          <span>22.000₫</span>
        </div>
        <div className="flex justify-between text-sm text-red-600 font-bold">
          <span>Giảm giá</span>
          <span>-10.000₫</span>
        </div>
        <div className="flex justify-between items-end mt-3 pt-3 border-t border-dashed border-coffee/10">
          <span className="font-bold text-lg text-coffee">Tổng cộng</span>
          <span className="text-3xl font-bold text-coffee font-price-display">232.000₫</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button className="h-16 bg-white border border-line rounded-xl font-bold text-xs text-coffee hover:bg-beige transition-all flex flex-col items-center justify-center gap-1 shadow-sm">
          <Save className="w-5 h-5" /> Lưu nháp
        </button>
        <button className="h-16 bg-white border border-line rounded-xl font-bold text-xs text-coffee hover:bg-beige transition-all flex flex-col items-center justify-center gap-1 shadow-sm">
          <FileText className="w-5 h-5" /> Ghi chú
        </button>
        <button className="h-16 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:opacity-80 transition-all flex flex-col items-center justify-center gap-1 shadow-sm">
          <Ban className="w-5 h-5" /> Hủy đơn
        </button>
      </div>
      <button className="w-full bg-gold hover:opacity-90 text-coffee h-16 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-between px-6 border border-coffee/5">
        <span className="uppercase tracking-widest text-sm">Thanh toán (Checkout)</span>
        <span className="font-price-display text-2xl">232.000₫</span>
      </button>
    </div>
  );
}
