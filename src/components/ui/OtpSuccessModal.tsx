import { useEffect, useState } from 'react';
import { CheckCircle2, Printer } from 'lucide-react';

interface OtpSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  approver?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}

export function OtpSuccessModal({
  isOpen,
  onClose,
  title = 'Xác thực thành công!',
  description = 'Ca làm việc đã được đối soát thành công và được phép đóng. Mọi dữ liệu đã được lưu trữ an toàn trong hệ thống.',
  approver = 'Quản lý Chuỗi',
  primaryActionLabel = 'In báo cáo & Kết thúc',
  secondaryActionLabel = 'Quay lại',
  onPrimaryAction,
  onSecondaryAction
}: OtpSuccessModalProps) {
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

      {/* Success Modal Card */}
      <div className="relative z-10 bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-line flex flex-col items-center p-8 text-center animate-in fade-in zoom-in duration-300">
        
        {/* Success Icon */}
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
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
            <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#5fa876] rounded-full"></span>
              Đã phê duyệt
            </span>
          </div>
          
          <div className="h-px bg-line/60 w-full"></div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted font-bold uppercase tracking-wider">Thời gian:</span>
            <span className="text-coffee font-semibold">{currentTime}</span>
          </div>
          
          <div className="h-px bg-line/60 w-full"></div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted font-bold uppercase tracking-wider">Người phê duyệt:</span>
            <span className="text-coffee font-semibold">{approver}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button 
            onClick={onPrimaryAction}
            className="w-full bg-coffee hover:bg-[#3f2d20] active:scale-[0.98] text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
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
