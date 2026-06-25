import { useState, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { getAuthSession } from '../../store/auth.store';
import { setup2FA, verify2FA } from '../../api/otp.api';
import { TwoFactorSuccessModal } from '../../components/settings/TwoFactorSuccessModal';
import { 
  Shield, 
  ShieldCheck, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle, 
  KeyRound, 
  Settings, 
  Lock, 
  HelpCircle,
  QrCode
} from 'lucide-react';

export function SettingsPage() {
  const authSession = getAuthSession();
  const userRole = (authSession?.user?.roleName || authSession?.user?.role || '').toLowerCase();
  // Role check: supports various chain admin/owner formats
  const isChainAdmin = userRole.includes('chain admin') || userRole.includes('owner') || userRole.includes('chain_admin');

  // Tabs
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');

  // 2FA Flow State
  const [isSetupInitiated, setIsSetupInitiated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  
  // 6-digit OTP state
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Verification status
  const [isVerified, setIsVerified] = useState(() => {
    return localStorage.getItem('little-hogsmeade-2fa-enabled') === 'true';
  });

  const [copySuccess, setCopySuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Trigger 2FA Generation
  const handleEnable2FA = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await setup2FA();
      if (response && response.qrCode) {
        setQrCode(response.qrCode);
        setSecret(response.secret || '');
        setIsSetupInitiated(true);
      } else {
        setError('Không thể khởi tạo mã QR từ máy chủ.');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo mã cấu hình 2FA.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy Key to Clipboard
  const handleCopyKey = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // OTP inputs handlers
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (value && isNaN(Number(value))) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next box
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        // Focus previous input and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Just clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (pastedData.length === 6 && !isNaN(Number(pastedData))) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  // Verify code with API
  const handleVerifyOtp = async () => {
    const codeStr = otp.join('');
    if (codeStr.length !== 6) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await verify2FA(codeStr);
      if (response && response.success) {
        setIsVerified(true);
        localStorage.setItem('little-hogsmeade-2fa-enabled', 'true');
        setShowSuccessModal(true);
      } else {
        setError('Mã xác nhận không đúng hoặc đã hết hạn.');
      }
    } catch (err: any) {
      setError(err.message || 'Mã OTP không hợp lệ, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset 2FA configuration flow
  const handleReset2FA = () => {
    setIsVerified(false);
    setIsSetupInitiated(false);
    setOtp(Array(6).fill(''));
    setQrCode('');
    setSecret('');
    setError(null);
    localStorage.removeItem('little-hogsmeade-2fa-enabled');
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title block */}
      <div>
        <h1 className="text-[34px] font-bold text-coffee tracking-tight">Cài đặt hệ thống</h1>
        <p className="text-muted text-sm mt-1">Phân quyền, cấu hình chi nhánh, thanh toán và cấu hình bảo mật.</p>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-line gap-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-bold transition-all ${
            activeTab === 'general'
              ? 'border-coffee text-coffee'
              : 'border-transparent text-muted hover:text-coffee'
          }`}
        >
          <Settings className="w-4 h-4" />
          Cài đặt chung
        </button>

        {isChainAdmin && (
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-bold transition-all ${
              activeTab === 'security'
                ? 'border-coffee text-coffee'
                : 'border-transparent text-muted hover:text-coffee'
            }`}
          >
            <Lock className="w-4 h-4" />
            Bảo mật & 2FA
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' ? (
        <Card className="p-8 bg-white border border-line rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold text-coffee mb-2">Thông tin hệ thống</h2>
          <p className="text-muted text-sm leading-relaxed mb-6">
            Hệ thống quản lý chuỗi Bistro & Cafe <span className="font-bold text-coffee">Little Hogsmeade</span> đang hoạt động bình thường. 
            Cấu hình chi nhánh, quản lý thực đơn và tính năng tích hợp thanh toán tự động được đồng bộ hóa từ máy chủ trung tâm.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-line/50">
            <div className="p-5 bg-cream rounded-xl border border-line/60">
              <h3 className="font-bold text-coffee mb-1 flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Chi nhánh hiện tại
              </h3>
              <p className="text-xs text-muted mb-3">Thông tin chi nhánh liên kết của phiên làm việc.</p>
              <p className="text-sm font-bold text-coffee bg-white px-3 py-2 rounded-lg border border-line/40 inline-block">
                Hogsmeade Central
              </p>
            </div>

            <div className="p-5 bg-cream rounded-xl border border-line/60">
              <h3 className="font-bold text-coffee mb-1 flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-coffee"></span> Phiên bản phần mềm
              </h3>
              <p className="text-xs text-muted mb-3">Chi tiết thông tin cập nhật ứng dụng.</p>
              <p className="text-sm font-bold text-coffee bg-white px-3 py-2 rounded-lg border border-line/40 inline-block">
                v1.2.0-pos (Radix UI)
              </p>
            </div>
          </div>
        </Card>
      ) : (
        /* 2FA Setup Interface (Exclusive for Chain Admins) */
        <Card className="bg-white rounded-2xl shadow-lg border border-line overflow-hidden animate-in fade-in duration-300">
          
          {/* Header Section */}
          <div className="p-6 lg:p-8 border-b border-line bg-cream flex justify-between items-center">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-coffee mb-1 flex items-center gap-2">
                <Lock className="w-6 h-6 text-gold" />
                Cấu hình Bảo mật Quản lý (2FA Verification)
              </h2>
              <p className="text-muted text-sm">
                Kích hoạt mã bảo mật OTP ứng dụng Google Authenticator để phê duyệt chốt ca làm việc.
              </p>
            </div>
            
            {isVerified && (
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Đang kích hoạt
              </span>
            )}
          </div>

          {/* Setup Forms */}
          {!isSetupInitiated && !isVerified ? (
            /* Intro / Launch State */
            <div className="p-8 text-center max-w-2xl mx-auto flex flex-col items-center py-12">
              <div className="w-16 h-16 rounded-full bg-cream border border-line flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-coffee" />
              </div>
              <h3 className="text-lg font-bold text-coffee mb-3">Xác thực 2 yếu tố (2-Factor Authentication)</h3>
              <p className="text-muted text-sm leading-relaxed mb-8">
                Tăng cường bảo mật cho các giao dịch quan trọng và thao tác chốt ca của cửa hàng bằng cách liên kết tài khoản quản lý với Google Authenticator hoặc Microsoft Authenticator.
              </p>
              
              {error && (
                <div className="mb-6 w-full p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2 text-left">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleEnable2FA}
                disabled={isLoading}
                className="flex items-center gap-2 bg-gold hover:opacity-90 active:scale-[0.98] text-coffee px-8 h-12 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang thiết lập...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    Kích hoạt 2FA (Google Authenticator)
                  </>
                )}
              </button>
            </div>
          ) : isVerified ? (
            /* Success / Active State */
            <div className="p-8 text-center max-w-2xl mx-auto flex flex-col items-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-coffee mb-3">Liên kết 2FA thành công!</h3>
              <p className="text-muted text-sm leading-relaxed mb-8">
                Thiết bị của bạn đã được đăng ký xác thực an toàn. Bạn có thể sử dụng mã OTP sinh ra từ ứng dụng Authenticator để phê duyệt chốt ca tại quầy POS.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handleReset2FA}
                  className="px-6 h-11 border border-line text-coffee rounded-xl font-semibold text-sm hover:bg-cream transition-colors"
                >
                  Cấu hình thiết bị mới
                </button>
              </div>
            </div>
          ) : (
            /* Active Setup Flow (Scannable QR + Verification Inputs) */
            <div>
              {error && (
                <div className="mx-6 lg:mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left Side: Setup QR code & Secret */}
                <div className="p-6 lg:p-8 border-r border-line bg-cream/20">
                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-full bg-cream border border-line text-coffee flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        1
                      </div>
                      <p className="text-sm text-coffee leading-relaxed">
                        Tải ứng dụng <span className="font-bold text-coffee">Google Authenticator</span> hoặc <span className="font-bold text-coffee">Microsoft Authenticator</span> trên App Store / Google Play.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-full bg-cream border border-line text-coffee flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        2
                      </div>
                      <p className="text-sm text-coffee leading-relaxed">
                        Quét mã QR bên dưới bằng camera của ứng dụng để tự động thêm tài khoản cấu hình hệ thống <span className="text-gold font-bold">Little Hogsmeade</span>.
                      </p>
                    </div>

                    {/* QR Rendering */}
                    <div className="flex flex-col items-center py-4">
                      <div className="bg-white p-4 rounded-2xl border border-line shadow-sm mb-4">
                        {qrCode ? (
                          <img src={qrCode} alt="TOTP 2FA QR Code" className="w-48 h-48 block" />
                        ) : (
                          <div className="w-48 h-48 flex items-center justify-center bg-cream rounded-xl">
                            <QrCode className="w-12 h-12 text-muted animate-pulse" />
                          </div>
                        )}
                      </div>

                      {/* Manual configuration code */}
                      <div className="w-full max-w-xs bg-cream/70 border border-line px-3 py-2.5 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="overflow-hidden pr-2">
                          <p className="text-[9px] uppercase tracking-wider text-muted font-bold mb-0.5">Mã thiết lập thủ công</p>
                          <p className="font-mono text-xs text-coffee font-bold truncate">
                            {secret || 'KVKFKRCPK5NEY-HOGS'}
                          </p>
                        </div>
                        <button 
                          onClick={handleCopyKey}
                          className="p-2 hover:bg-beige rounded-lg transition-colors group relative" 
                          title="Sao chép"
                        >
                          {copySuccess ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gold hover:text-coffee transition-colors" />
                          )}
                          
                          {copySuccess && (
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-coffee text-white text-[10px] py-1 px-2 rounded shadow-sm font-bold whitespace-nowrap">
                              Đã sao chép
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Verification Step */}
                <div className="p-6 lg:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-3 items-start mb-6">
                      <div className="w-7 h-7 rounded-full bg-cream border border-line text-coffee flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        3
                      </div>
                      <p className="text-sm text-coffee leading-relaxed">
                        Nhập mã xác nhận 6 chữ số đang hiển thị trên ứng dụng của bạn để hoàn tất quá trình liên kết.
                      </p>
                    </div>

                    {/* Code Inputs Grid */}
                    <div className="flex flex-col items-center py-6 gap-6">
                      <div className="flex gap-2 justify-center">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => { inputRefs.current[idx] = el; }}
                            value={digit}
                            onChange={(e) => handleOtpChange(e.target, idx)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            onPaste={handlePaste}
                            maxLength={1}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="w-12 h-14 text-center text-xl font-bold bg-cream rounded-xl border border-line focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-coffee transition-all shadow-inner"
                          />
                        ))}
                      </div>

                      {/* Confirm Button */}
                      <button
                        onClick={handleVerifyOtp}
                        disabled={!isOtpComplete || isLoading}
                        className="w-full h-12 bg-gold hover:opacity-90 active:scale-[0.98] text-coffee rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Đang xác nhận...
                          </>
                        ) : (
                          'Xác nhận & Lưu cấu hình'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Customer support link */}
                  <div className="text-center mt-6">
                    <a href="#" className="text-xs text-muted hover:text-coffee transition-colors inline-flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Tôi cần hỗ trợ thêm về thiết bị?
                    </a>
                  </div>
                </div>
              </div>

              {/* Warning/Attention Footer info banner */}
              <div className="bg-[#ba1a1a]/5 border-t border-line p-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#ba1a1a] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#ba1a1a] italic leading-relaxed">
                  <span className="font-bold">Lưu ý:</span> Khóa bí mật (secret key) này dùng để khôi phục hoặc thiết lập lại Authenticator khi đổi thiết bị. Vui lòng ghi lại hoặc lưu trữ ở nơi bảo mật trước khi thoát để tránh mất quyền chốt ca.
                </p>
              </div>
            </div>
          )}
        </Card>
      )}
      <TwoFactorSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        email={authSession?.user?.email || authSession?.user?.name || undefined}
      />
    </div>
  );
}
