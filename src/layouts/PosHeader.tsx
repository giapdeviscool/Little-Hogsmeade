import { useState } from 'react';
import { Bell, Clock, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { clearAuthSession } from '@/store/auth.store';

const NAV_LINKS = [
  { name: 'Thu Ngân', link: ROUTES.pos, exact: true },
  { name: 'Bàn', link: ROUTES.posTables, exact: false },
  { name: 'Hóa Đơn', link: ROUTES.invoices, exact: false },
  { name: 'Tổng Quan', link: ROUTES.shiftOverview, exact: false },
  { name: 'Quản lý', link: ROUTES.adminOperations, exact: false },
];

export function PosHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    clearAuthSession();
    navigate(ROUTES.login);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 h-16 bg-white border-b border-line shadow-sm">
      <div className="flex items-center gap-5">
        <h1 className="text-[22px] font-bold text-coffee tracking-tight">
          Little Hogsmeade
        </h1>
        <div className="hidden md:flex items-center gap-5 ml-6">
          {NAV_LINKS.map((item) => {
            const isActive = item.exact ? location.pathname === item.link : location.pathname.includes(item.link);
            
            return (
              <Link 
                key={item.name}
                to={item.link}
                className={`text-xs transition-colors ${isActive ? 'font-bold text-coffee border-b-2 border-coffee pb-0.5' : 'font-semibold text-muted hover:text-coffee'}`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <button className="w-10 h-10 flex items-center justify-center text-coffee hover:bg-cream rounded-full transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-coffee hover:bg-cream rounded-full transition-colors">
            <Clock className="w-5 h-5" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-8 h-8 rounded-full bg-cream flex items-center justify-center overflow-hidden border border-line ml-1.5 focus:outline-none focus:ring-2 focus:ring-coffee/20 transition-all cursor-pointer"
            >
              <img className="w-full h-full object-cover pointer-events-none" alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNmNtfGJxHIdWDkjrNtEGd5eHWCCk-LJbRr0KuW1d5C6EdIN5N5vzTb1DOrZTL8fpNvy1ONI40ymYMW_KywYkFNadOg8ZJlcclTmr4KD8aAl6JSMCMaohTuR-vx2ptgK_K4u1vIKgqsenxkj5A4_c4pD4aLCfVgi2xSF4Y1kpdHoei78VTA_h34-W7h4_DQVIs3wAPZrkQ5Aju9fpVc_JOpvm_Sfs92JwEtshViB3Us_KeXQ5iBHem-5KQ1NNT4Znl9DyfBFplL60v" />
            </button>
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-line z-50 overflow-hidden py-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <button 
          onClick={() => navigate(ROUTES.shiftClosing)}
          className="bg-coffee text-white text-xs font-bold h-9 px-4.5 rounded-lg hover:opacity-90 active:scale-95 transition-all ml-1.5 shadow-sm"
        >
          End Shift
        </button>
      </div>
    </header>
  );
}
