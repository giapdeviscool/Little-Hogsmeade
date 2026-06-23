import { Star, Printer, RotateCcw, X } from 'lucide-react';
import type { Invoice } from '@/components/invoices/InvoiceTable';

interface InvoiceDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefund: () => void;
  invoice: Invoice | null;
}

export function InvoiceDetailPanel({ isOpen, onClose, onRefund, invoice }: InvoiceDetailPanelProps) {
  return (
    <div className={`absolute top-0 right-0 h-full w-[35%] border-l border-line bg-white flex flex-col transition-transform duration-300 z-10 ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none'}`}>
      <div className="p-8 border-b border-line flex justify-between items-center bg-cream/30">
        <div>
          <h3 className="text-2xl font-bold text-coffee">Chi tiết Đơn hàng</h3>
          <p className="text-xs font-bold text-gold tracking-widest mt-1">MÃ ĐƠN: {invoice?.id || '#LH-98210'}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${invoice?.status === 'refunded' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
            {invoice?.status === 'refunded' ? 'Hoàn tiền' : 'Đã thanh toán'}
          </span>
          <button onClick={onClose} className="p-2 hover:bg-beige rounded-full transition-colors text-muted hover:text-coffee">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        <div className="p-6 rounded-2xl bg-beige/40 border border-line">
          <div className="flex items-center gap-3 mb-5">
            <Star className="w-5 h-5 text-gold fill-gold" />
            <span className="font-bold text-coffee uppercase tracking-wider text-sm">Thông tin Thành viên</span>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-1">Số điện thoại</p>
              <p className="font-bold text-coffee">***8901</p>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-1">Điểm tích lũy</p>
              <p className="font-bold text-gold">150 pts</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-[10px] font-bold text-muted uppercase mb-6 tracking-widest">Danh sách món ăn</h4>
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-coffee">Butterbeer Latte (Lớn)</p>
                <p className="text-xs text-muted mt-1">x2 @ ₫162.500 • Sữa đậu nành, Thêm nóng</p>
              </div>
              <span className="font-bold text-coffee">₫325.000</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-coffee">Pumpkin Pasty</p>
                <p className="text-xs text-muted mt-1">x1 @ ₫112.500</p>
              </div>
              <span className="font-bold text-coffee">₫112.500</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-coffee">Cauldron Cake</p>
                <p className="text-xs text-muted mt-1">x1 @ ₫175.000</p>
              </div>
              <span className="font-bold text-coffee">₫175.000</span>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t-2 border-dashed border-line space-y-3">
            <div className="flex justify-between text-sm text-muted">
              <span>Tạm tính</span>
              <span>₫612.500</span>
            </div>
            <div className="flex justify-between text-sm text-muted">
              <span>Thuế (0%)</span>
              <span>₫0</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-coffee pt-4">
              <span>Tổng thanh toán</span>
              <span className="text-gold">{invoice?.total || '₫612.500'}</span>
            </div>
          </div>
        </div>
        
        <div className="pt-6 text-[10px] text-muted flex justify-between italic uppercase tracking-wider font-medium">
          <span>Thu ngân: #4412 (Luna L.)</span>
          <span>Máy POS: 01</span>
        </div>
      </div>
      
      <div className="p-8 bg-cream/30 border-t border-line grid grid-cols-1 gap-4">
        <button className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-line text-coffee rounded-xl font-bold text-sm hover:bg-beige transition-all shadow-sm active:scale-95">
          <Printer className="w-5 h-5" /> In lại hóa đơn
        </button>
        <button onClick={onRefund} className="w-full h-14 flex items-center justify-center gap-3 bg-coffee text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-md active:scale-95">
          <RotateCcw className="w-5 h-5" /> Hoàn tiền (Refund)
        </button>
      </div>
    </div>
  );
}
