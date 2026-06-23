import { Search } from 'lucide-react';

export function SearchFilter() {
  return (
    <div className="p-6 bg-white/50 space-y-4">
      {/* Search Bar */}
      <div className="relative w-full">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          <Search className="w-5 h-5" />
        </span>
        <input className="w-full pl-12 pr-4 py-3 bg-white border border-line rounded-xl focus:ring-2 focus:ring-coffee/20 font-sans text-sm outline-none shadow-sm" placeholder="Tìm kiếm món ăn, đồ uống..." type="text" />
      </div>
      {/* Category Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        <button className="h-11 px-6 rounded-full font-bold whitespace-nowrap bg-latte text-white shadow-sm transition-all">Tất cả</button>
        <button className="h-11 px-6 rounded-full font-bold whitespace-nowrap bg-white text-coffee border border-line hover:bg-latte/10 transition-all">Cà phê</button>
        <button className="h-11 px-6 rounded-full font-bold whitespace-nowrap bg-white text-coffee border border-line hover:bg-latte/10 transition-all">Trà</button>
        <button className="h-11 px-6 rounded-full font-bold whitespace-nowrap bg-white text-coffee border border-line hover:bg-latte/10 transition-all">Bánh ngọt</button>
        <button className="h-11 px-6 rounded-full font-bold whitespace-nowrap bg-white text-coffee border border-line hover:bg-latte/10 transition-all">Món chính</button>
        <button className="h-11 px-6 rounded-full font-bold whitespace-nowrap bg-white text-coffee border border-line hover:bg-latte/10 transition-all">Nước ép</button>
      </div>
    </div>
  );
}
