import { Bell, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function InvoiceHeader() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-white border-b border-line shadow-sm">
      <div className="flex items-center gap-10">
        <span className="text-2xl font-bold text-coffee font-serif">Little Hogsmeade</span>
        <nav className="hidden lg:flex items-center gap-8">
          <Link className="text-muted hover:text-coffee font-medium transition-colors" to={ROUTES.home}>Dashboard</Link>
          <Link className="text-coffee border-b-2 border-coffee font-bold pb-1" to={ROUTES.invoices}>Hóa đơn</Link>
          <a className="text-muted hover:text-coffee font-medium transition-colors" href="#">Kho hàng</a>
          <a className="text-muted hover:text-coffee font-medium transition-colors" href="#">Báo cáo</a>
        </nav>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-beige transition-colors">
            <Clock className="w-5 h-5 text-coffee" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-beige transition-colors">
            <Bell className="w-5 h-5 text-coffee" />
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-line">
            <img alt="User" className="w-10 h-10 rounded-full object-cover border-2 border-beige" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl2mHPVJaSh2h6qLe6xYrNtgHj1W_EpH20GN_5m4ofRejvc3S6zmoCVxLZtp_9wyTBln_foZqdAqTuPIqoh4_UAJ4PvGCcSPNpvDgFQHDWYbZaLoPFF1VId3Ye_hF4WwrS39of4tZU6QrNVakZe5f7cKkKpMe_cpCOWtnKLEa1IhIEnfxO4Iz7zH0XpZpNSL-QqO0asL4MSiTzWAFmRXsYifcYQ8PI_U443E-xWEW_1M8HiTPvMdfYp9bcxc7MaoehW-R8af82AmqI"/>
            <span className="font-bold text-sm text-coffee">Kết thúc ca</span>
          </div>
        </div>
      </div>
    </header>
  );
}
