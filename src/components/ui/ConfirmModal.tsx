
interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Xác nhận', cancelText = 'Huỷ' }: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-xl flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3 mt-auto">
          <button onClick={onCancel} className="rounded-[14px] px-4 py-2 font-medium hover:bg-gray-100">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="rounded-[14px] bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
