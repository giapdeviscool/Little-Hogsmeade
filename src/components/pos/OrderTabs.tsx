import { Trash2, User, Award } from 'lucide-react';

export function OrderTabs() {
  return (
    <div className="p-6 border-b border-line">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-coffee">Đơn hàng #1024</h2>
          <p className="text-xs text-muted uppercase tracking-wider font-semibold mt-1">NV: Nguyễn Anh Tuấn • 14:25 PM</p>
        </div>
        <button className="text-muted hover:text-red-500 w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-all">
          <Trash2 className="w-6 h-6" />
        </button>
      </div>
      <div className="flex gap-2 p-1 bg-beige rounded-xl">
        <button className="flex-1 h-12 text-sm font-bold rounded-lg bg-white shadow-sm flex items-center justify-center gap-2 border border-line/50 text-coffee">
          <User className="w-5 h-5" /> Khách vãng lai
        </button>
        <button className="flex-1 h-12 text-sm font-bold text-muted flex items-center justify-center gap-2 hover:bg-white/50 transition-colors rounded-lg">
          <Award className="w-5 h-5 text-gold" /> Thành viên
        </button>
      </div>
    </div>
  );
}
