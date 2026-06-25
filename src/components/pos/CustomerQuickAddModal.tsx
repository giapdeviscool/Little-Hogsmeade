import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { quickRegisterCustomer } from '@/api/customer.api';
import type { Customer } from '@/types/customer.types';

interface CustomerQuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneQuery: string;
  onSuccess: (newCustomer: Customer) => void;
}

export function CustomerQuickAddModal({
  isOpen,
  onClose,
  phoneQuery,
  onSuccess,
}: CustomerQuickAddModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync phone state with phoneQuery when modal is opened
  useEffect(() => {
    if (isOpen) {
      setPhone(phoneQuery);
      setName('');
      setError(null);
      setStatus('idle');
      // Use setTimeout to ensure input is rendered before focus
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, phoneQuery]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên khách hàng.');
      return;
    }
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại.');
      return;
    }
    
    // Simple phone regex validation (Vietnamese phones generally have 10 digits)
    const phoneRegex = /^0[1-9][0-9]{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError('Số điện thoại không hợp lệ. Phải gồm 10 chữ số (vd: 0987654321).');
      return;
    }

    setError(null);
    setStatus('submitting');

    try {
      const res = (await quickRegisterCustomer({
        name: name.trim(),
        phone: phone.trim(),
      })) as any;

      if (res.success && res.data) {
        setStatus('success');
        
        // Success animation plays for 800ms
        setTimeout(() => {
          // Map response data to client Customer type
          const newCustomer: Customer = {
            id: res.data!._id || res.data!.id,
            fullName: res.data!.name || res.data!.fullName || name.trim(),
            phone: res.data!.phone,
            createdAt: new Date().toISOString(),
            source: 'walk-in',
            isNew: true,
          };
          onSuccess(newCustomer);
          onClose();
        }, 800);
      } else {
        throw new Error(res.message || 'Đăng ký không thành công.');
      }
    } catch (err: any) {
      setStatus('idle');
      // If duplicate record / conflict
      if (
        err.message?.includes('409') ||
        err.message?.toLowerCase().includes('đã tồn tại') ||
        err.message?.toLowerCase().includes('conflict')
      ) {
        setError('Số điện thoại này đã tồn tại trong hệ thống.');
      } else {
        setError(err.message || 'Đã xảy ra lỗi khi đăng ký khách hàng.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-line shadow-soft overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-line bg-cream">
          <h3 className="text-sm font-bold text-coffee uppercase tracking-wide">
            Đăng ký nhanh hội viên
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={status === 'submitting' || status === 'success'}
            className="text-muted hover:text-coffee transition-colors disabled:opacity-30"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider">
              Số điện thoại
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={status === 'submitting' || status === 'success'}
              placeholder="Nhập số điện thoại..."
              className="w-full h-10 px-3 bg-beige/35 border border-line rounded-lg text-xs text-coffee outline-none focus:border-coffee transition-colors disabled:bg-beige/10 disabled:text-muted"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider">
              Tên khách hàng <span className="text-[#c25a5a] font-normal">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === 'submitting' || status === 'success'}
              placeholder="Nhập họ & tên khách hàng..."
              className="w-full h-10 px-3 bg-white border border-line rounded-lg text-xs text-coffee outline-none focus:border-coffee transition-colors disabled:bg-beige/10 disabled:text-muted"
            />
          </div>

          {/* Inline warning for Conflict or Validation Errors */}
          {error && (
            <div className="text-xs text-[#c25a5a] bg-[#c25a5a]/5 p-3 rounded-lg font-medium flex items-start gap-2 border border-[#c25a5a]/12">
              <AlertCircle className="w-4.5 h-4.5 text-[#c25a5a] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons with Morphing transition */}
          <div className="flex gap-2 mt-2">
            {status === 'success' ? (
              // Success Checkmark button replacing both actions
              <div className="w-full h-10 bg-[#5fa876] text-white rounded-lg flex items-center justify-center gap-1.5 animate-scale-in font-bold text-xs shadow-sm">
                <Check className="w-4.5 h-4.5 stroke-[3.5] animate-pulse" />
                <span>Đăng ký thành công!</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={status === 'submitting'}
                  className="flex-1 h-10 rounded-lg text-xs font-bold border border-line text-coffee hover:bg-beige/40 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex-1 h-10 bg-coffee text-white rounded-lg text-xs font-bold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 disabled:bg-coffee/60"
                >
                  {status === 'submitting' ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Xác nhận & Thêm</span>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
