import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface TwoFactorSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
}

export function TwoFactorSuccessModal({ isOpen, onClose, email }: TwoFactorSuccessModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const displayEmail = email || 'chain-admin@littlehogsmeade.com';

  const handleDashboardReturn = () => {
    onClose();
    navigate(ROUTES.adminDashboard);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-coffee/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Success Modal Container */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-line shadow-2xl overflow-hidden p-8 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mb-6 animate-bounce">
          <ShieldCheck className="w-12 h-12 text-coffee" />
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-bold text-coffee mb-2">
          Kích hoạt thành công!
        </h2>

        {/* Body Text */}
        <p className="text-sm text-muted mb-6 leading-relaxed max-w-xs">
          Ứng dụng Google Authenticator của bạn đã được liên kết thành công. Bây giờ bạn có thể sử dụng mã OTP để phê duyệt các giao dịch quan trọng và chốt ca.
        </p>

        {/* Summary Block */}
        <div className="w-full bg-cream border border-line/60 rounded-xl p-4 mb-6 flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted uppercase tracking-wider">Tài khoản</span>
            <span className="font-semibold text-coffee">{displayEmail}</span>
          </div>
          <div className="h-px bg-line/60 w-full"></div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted uppercase tracking-wider">Trạng thái</span>
            <div className="flex items-center gap-1.5 text-[#5fa876]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5fa876] animate-pulse"></span>
              <span className="font-bold">Đã kích hoạt</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleDashboardReturn}
          className="w-full bg-coffee hover:bg-[#3f2d20] text-white font-bold h-12 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md group"
        >
          Hoàn tất & Quay lại Dashboard
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Footer decoration */}
        <div className="mt-6 flex items-center gap-1.5 opacity-40 text-xs text-coffee font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Bảo mật cấp độ Bistro Management</span>
        </div>
      </div>
    </div>
  );
}
