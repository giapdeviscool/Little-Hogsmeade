import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { Bell } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { TableLayoutPage } from './TableLayoutPage'
import { ReservationManager } from './ReservationManager'

interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

export function OperationsPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'tables'
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Bàn T1-04 đã chuyển sang Đang dọn',
      description: 'Bàn T1-04 vừa đổi trạng thái phục vụ sang dọn dẹp lúc 11:05.',
      time: '5 phút trước',
      read: false,
    },
    {
      id: '2',
      title: 'Yêu cầu thanh toán',
      description: 'Khách hàng tại Bàn N-03 yêu cầu xuất hóa đơn thanh toán.',
      time: '12 phút trước',
      read: false,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleClearAll = () => {
    setNotifications([])
  }
  
  return (
    <div className="space-y-6 relative">
      {/* Global Notification Bell in top right corner */}
      <div className="absolute right-0 top-0 z-50">
        <div className="relative">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            className="relative size-10 rounded-xl border-line bg-white shadow-soft hover:bg-cream transition cursor-pointer"
          >
            <Bell className="size-4 text-coffee" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-gold ring-2 ring-white" />
            )}
          </Button>

          {isOpen && (
            <>
              {/* Invisible overlay to close on clicking outside */}
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              
              {/* Dropdown Popover */}
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-line bg-white p-4 shadow-xl z-50 text-coffee">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
                  <h3 className="font-bold text-sm">Thông báo</h3>
                  {notifications.length > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-latte hover:underline font-semibold cursor-pointer border-none bg-transparent"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>
                
                {/* Notifications List */}
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.length > 0 ? (
                    notifications.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleMarkAsRead(item.id)}
                        className={cn(
                          "p-2.5 rounded-xl border border-line flex flex-col gap-1 text-xs cursor-pointer transition text-left",
                          item.read ? "bg-white hover:bg-cream/40" : "bg-beige/25 hover:bg-beige/40 border-gold/20"
                        )}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-bold text-coffee flex items-center gap-1.5 leading-tight">
                            {!item.read && <span className="size-1.5 rounded-full bg-gold shrink-0" />}
                            {item.title}
                          </span>
                          <span className="text-[9px] text-muted shrink-0 mt-0.5">{item.time}</span>
                        </div>
                        <p className="text-muted/95 text-[11px] leading-relaxed">{item.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-muted flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">🔔</span>
                      <p className="text-xs font-bold text-coffee/60">Chưa có thông báo nào</p>
                    </div>
                  )}
                </div>
                
                {/* Clear All Footer */}
                {notifications.length > 0 && (
                  <div className="border-t border-line mt-3 pt-2 text-center">
                    <button 
                      onClick={handleClearAll}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer border-none bg-transparent"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
          Vận hành & Phục vụ
        </p>
        <h1 className="mt-2 text-[34px] font-bold tracking-[-0.04em]">
          {activeTab === 'tables' ? 'Danh sách bàn' : 'Quản lý đặt bàn'}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          {activeTab === 'tables' 
            ? 'Theo dõi danh sách các bàn của quán, hỗ trợ nhận khách nhanh và đặt bàn trước.'
            : 'Quản lý danh sách khách hàng đã đặt bàn trước, tiện lợi cho việc sắp xếp và gán bàn.'}
        </p>
      </div>

      <div className="mt-10">
        {activeTab === 'tables' && <TableLayoutPage />}
        {activeTab === 'reservations' && <ReservationManager />}
      </div>
    </div>
  )
}
