import { Coffee, PlusCircle, IceCream, Croissant, Utensils, ShoppingBag, Settings, HelpCircle } from 'lucide-react';

export function PosSidebar() {
  return (
    <nav className="fixed left-0 top-20 h-[calc(100vh-80px)] flex flex-col py-6 bg-beige w-72 border-r border-line hidden lg:flex">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-6 p-3 bg-cream rounded-2xl border border-line">
          <div className="w-12 h-12 bg-coffee rounded-xl flex items-center justify-center shadow-md">
            <Coffee className="text-white w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-coffee text-sm uppercase tracking-wide">Little Hogsmeade</p>
            <p className="text-[10px] text-muted uppercase tracking-widest font-semibold">Table Service Mode</p>
          </div>
        </div>
        <button className="w-full bg-coffee text-white h-14 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg">
          <PlusCircle className="w-5 h-5" />
          New Order
        </button>
      </div>
      <div className="flex flex-col gap-1 px-3 overflow-y-auto flex-1">
        <a className="flex items-center gap-4 bg-latte text-white rounded-xl h-12 px-5 transition-all shadow-sm" href="#">
          <Coffee className="w-5 h-5" />
          <span className="font-semibold text-sm">Hot Drinks</span>
        </a>
        <a className="flex items-center gap-4 text-coffee h-12 px-5 hover:bg-cream rounded-xl transition-colors" href="#">
          <IceCream className="w-5 h-5 text-muted" />
          <span className="font-medium text-sm">Cold Brews</span>
        </a>
        <a className="flex items-center gap-4 text-coffee h-12 px-5 hover:bg-cream rounded-xl transition-colors" href="#">
          <Croissant className="w-5 h-5 text-muted" />
          <span className="font-medium text-sm">Pastries</span>
        </a>
        <a className="flex items-center gap-4 text-coffee h-12 px-5 hover:bg-cream rounded-xl transition-colors" href="#">
          <Utensils className="w-5 h-5 text-muted" />
          <span className="font-medium text-sm">Kitchen</span>
        </a>
        <a className="flex items-center gap-4 text-coffee h-12 px-5 hover:bg-cream rounded-xl transition-colors" href="#">
          <ShoppingBag className="w-5 h-5 text-muted" />
          <span className="font-medium text-sm">Merch</span>
        </a>
      </div>
      <div className="mt-auto border-t border-line pt-6 px-3">
        <a className="flex items-center gap-4 text-muted h-12 px-5 hover:bg-cream rounded-xl transition-colors" href="#">
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Settings</span>
        </a>
        <a className="flex items-center gap-4 text-muted h-12 px-5 hover:bg-cream rounded-xl transition-colors" href="#">
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium text-sm">Support</span>
        </a>
      </div>
    </nav>
  );
}
