import React from 'react'

interface AlertModalProps {
  isOpen: boolean
  title: string
  message: string
  onClose: () => void
  buttonText?: string
  type?: 'success' | 'error' | 'info'
}

export function AlertModal({ isOpen, title, message, onClose, buttonText = 'Đóng', type = 'info' }: AlertModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-xl flex flex-col items-center text-center">
        {type === 'success' && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {type === 'error' && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <button onClick={onClose} className="rounded-[14px] bg-coffee px-6 py-2 font-medium text-white hover:opacity-90 w-full">
          {buttonText}
        </button>
      </div>
    </div>
  )
}
