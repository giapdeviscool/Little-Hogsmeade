import { useEffect, useState } from 'react';
import { XCircle, RefreshCw } from 'lucide-react';

interface OtpFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  faultReason?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}

export function OtpFailureModal({
  isOpen,
  onClose,
  title = 'Xác thực thất bại!',
  description = 'Mã xác thực OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại thiết bị Authenticator của bạn.',
  faultReason = 'Mã bảo mật không trùng khớp',
  primaryActionLabel = 'Thử lại ngay',
  secondaryActionLabel = 'Quay lại',
  onPrimaryAction,
  onSecondaryAction
}: OtpFailureModalProps) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString('vi-VN');
      setCurrentTime(`${timeStr}, ${dateStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSecondaryClick = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-coffee/20 backdrop-blur-md transition-opacity duration-300"
        onClick={handleSecondaryClick}
      ></div>

      {/* Failure Modal Card */}
      <div className="relative z-10 bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-line flex flex-col items-center p-8 text-center animate-in fade-in zoom-in duration-300">
        
        {/* Failure Icon */}
        <div className="mb-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center animate-bounce">
            <XCircle className="w-10 h-10 text-[#c25a5a]" />
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl font-bold text-coffee mb-1.5">{title}</h2>
        <p className="text-sm text-muted px-2 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Details Card */}
        <div className="w-full bg-cream rounded-xl p-4 border border-line/60 mb-6 text-left space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted font-bold uppercase tracking-wider">Trạng thái:</span>
            <span className="bg-red-50 text-[#c25a5a] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#c25a5a] rounded-full"></span>
              Thất bại / Lỗi
            </span>
          </div>
          
          <div className="h-px bg-line/60 w-full"></div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted font-bold uppercase tracking-wider">Thời gian:</span>
            <span className="text-coffee font-semibold">{currentTime}</span>
          </div>
          
          <div className="h-px bg-line/60 w-full"></div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted font-bold uppercase tracking-wider">Chi tiết lỗi:</span>
            <span className="text-[#c25a5a] font-bold">{faultReason}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button 
            onClick={onPrimaryAction}
            className="w-full bg-[#c25a5a] hover:bg-[#b04f4f] active:scale-[0.98] text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            {primaryActionLabel}
          </button>
          
          <button 
            onClick={handleSecondaryClick}
            className="w-full text-coffee hover:bg-beige rounded-xl font-bold h-12 transition-colors uppercase tracking-widest text-xs"
          >
            {secondaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
