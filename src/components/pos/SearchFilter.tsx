export function SearchFilter() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
      <button className="h-11 px-6 rounded-full font-bold whitespace-nowrap bg-latte text-white shadow-sm transition-all">Cà phê</button>
      <button className="h-11 px-6 rounded-full font-bold whitespace-nowrap bg-cream text-coffee border border-line hover:bg-latte/10 transition-all">Trà</button>
      <button className="h-11 px-6 rounded-full font-bold whitespace-nowrap bg-cream text-coffee border border-line hover:bg-latte/10 transition-all">Bánh ngọt</button>
      <button className="h-11 px-6 rounded-full font-bold whitespace-nowrap bg-cream text-coffee border border-line hover:bg-latte/10 transition-all">Món chính</button>
      <button className="h-11 px-6 rounded-full font-bold whitespace-nowrap bg-cream text-coffee border border-line hover:bg-latte/10 transition-all">Nước ép</button>
    </div>
  );
}
