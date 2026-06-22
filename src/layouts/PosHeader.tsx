import { Bell, Clock, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export function PosHeader() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-white border-b border-line shadow-sm">
      <div className="flex items-center gap-6">
        <h1 className="text-[28px] font-bold text-coffee tracking-tight">
          Little Hogsmeade
        </h1>
        <div className="hidden md:flex items-center gap-6 ml-8">
          <Link className="text-sm font-bold text-coffee border-b-2 border-coffee pb-1" to={ROUTES.home}>Dashboard</Link>
          <Link className="text-sm font-semibold text-muted hover:text-coffee transition-colors" to={ROUTES.pos}>Orders</Link>
          <a className="text-sm font-semibold text-muted hover:text-coffee transition-colors" href="#">Inventory</a>
          <a className="text-sm font-semibold text-muted hover:text-coffee transition-colors" href="#">Reports</a>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button className="w-12 h-12 flex items-center justify-center text-coffee hover:bg-cream rounded-full transition-colors">
            <Bell className="w-6 h-6" />
          </button>
          <button className="w-12 h-12 flex items-center justify-center text-coffee hover:bg-cream rounded-full transition-colors">
            <Clock className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center overflow-hidden border border-line ml-2">
            <img className="w-full h-full object-cover" alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNmNtfGJxHIdWDkjrNtEGd5eHWCCk-LJbRr0KuW1d5C6EdIN5N5vzTb1DOrZTL8fpNvy1ONI40ymYMW_KywYkFNadOg8ZJlcclTmr4KD8aAl6JSMCMaohTuR-vx2ptgK_K4u1vIKgqsenxkj5A4_c4pD4aLCfVgi2xSF4Y1kpdHoei78VTA_h34-W7h4_DQVIs3wAPZrkQ5Aju9fpVc_JOpvm_Sfs92JwEtshViB3Us_KeXQ5iBHem-5KQ1NNT4Znl9DyfBFplL60v" />
          </div>
        </div>
        <button className="bg-coffee text-white text-sm font-bold h-11 px-6 rounded-xl hover:opacity-90 active:scale-95 transition-all ml-2 shadow-sm">
          End Shift
        </button>
      </div>
    </header>
  );
}
