import { useEffect, useState, useCallback } from 'react';
import { 
  Truck, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone, 
  MapPin, 
  User, 
  ChevronRight, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { 
  getDeliveryOrders, 
  assignShipper, 
  updateDeliveryStatus, 
  getEmployees
} from '../../api/delivery.api';
import type { DeliveryOrder } from '../../api/delivery.api';
import { Card } from '../../components/ui/Card';
import { cn } from '../../utils/cn';

interface Shipper {
  id: string;
  fullName: string;
  phone: string;
}

export function DeliveryManagementTab() {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal / Dialog States
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedShipperId, setSelectedShipperId] = useState<string>('');
  const [noteText, setNoteText] = useState('');
  const [failDialogId, setFailDialogId] = useState<string | null>(null);

  // Load shippers once
  const loadShippers = useCallback(async () => {
    try {
      const employeesRes = await getEmployees();
      const rawData = employeesRes?.data;
      const allEmployees = Array.isArray(rawData)
        ? rawData
        : (rawData && Array.isArray(rawData.items) ? rawData.items : []);
      
      // Filter employees whose role contains 'shipper' or 'giao hàng'
      const shipperList = allEmployees
        .filter((emp: any) => {
          const roleName = emp.role?.name?.toLowerCase() || '';
          return roleName.includes('shipper') || roleName.includes('giao hàng');
        })
        .map((emp: any) => ({
          id: emp.id,
          fullName: emp.fullName,
          phone: emp.phone || ''
        }));
        
      setShippers(shipperList);
    } catch (err) {
      console.error('Failed to load shippers:', err);
    }
  }, []);

  // Fetch only deliveries
  const fetchDeliveries = useCallback(async (showGlobalSpinner = false) => {
    if (showGlobalSpinner) {
      setLoading(true);
    }
    setError(null);
    try {
      const deliveryRes = await getDeliveryOrders();
      setDeliveries(deliveryRes.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Không thể tải danh sách giao hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchDeliveries(true),
        loadShippers()
      ]);
    };
    init();
  }, [fetchDeliveries, loadShippers]);

  // Handle Quick Status Changes
  const handleStatusChange = async (deliveryId: string, nextStatus: string, note?: string) => {
    try {
      await updateDeliveryStatus(deliveryId, nextStatus, note);
      await fetchDeliveries(false); // silent refresh
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái đơn hàng.');
    }
  };

  // Assign Shipper Submit
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningId || !selectedShipperId) return;
    try {
      await assignShipper(assigningId, selectedShipperId);
      setAssigningId(null);
      setSelectedShipperId('');
      await fetchDeliveries(false); // silent refresh
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gán shipper.');
    }
  };

  // Fail Status Submit
  const handleFailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!failDialogId) return;
    try {
      await handleStatusChange(failDialogId, 'failed', noteText);
      setFailDialogId(null);
      setNoteText('');
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái thất bại.');
    }
  };

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = async (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    const deliveryId = e.dataTransfer.getData('text/plain');
    if (!deliveryId) return;

    const delivery = deliveries.find(d => d.delivery_id === deliveryId);
    if (!delivery) return;

    if (columnStatus === 'pending') {
      await handleStatusChange(deliveryId, 'pending');
    } else if (columnStatus === 'assigned') {
      // Need to choose shipper
      setAssigningId(deliveryId);
      setSelectedShipperId(delivery.delivery_employee?.id || '');
    } else if (columnStatus === 'on_the_way') {
      if (!delivery.delivery_employee) {
        alert('Vui lòng gán shipper trước khi chuyển sang trạng thái đang giao.');
        return;
      }
      await handleStatusChange(deliveryId, 'on_the_way');
    } else if (columnStatus === 'delivered') {
      await handleStatusChange(deliveryId, 'delivered');
    } else if (columnStatus === 'failed') {
      setFailDialogId(deliveryId);
    }
  };

  // Group deliveries by status for Kanban columns
  const getColumnData = (columnKey: string) => {
    if (columnKey === 'history') {
      return deliveries.filter(d => d.status === 'delivered' || d.status === 'failed');
    }
    // Handle status variations
    if (columnKey === 'on_the_way') {
      return deliveries.filter(d => d.status === 'on_the_way' || d.status === 'on-the-way');
    }
    return deliveries.filter(d => d.status === columnKey);
  };

  // Check if delivery has breached SLA (e.g. estimated time has passed and not completed)
  const isSlaBreached = (estTimeStr: string | null, status: string) => {
    if (!estTimeStr) return false;
    if (status === 'delivered' || status === 'failed') return false;
    return new Date(estTimeStr).getTime() < Date.now();
  };



  if (loading && deliveries.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Clock className="h-8 w-8 animate-spin text-coffee" />
        <span className="ml-2 font-semibold text-coffee">Đang tải danh sách đơn giao hàng...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-[#c25a5a]/20 bg-red-50 p-4 text-sm font-semibold text-[#c25a5a] flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 min-h-[600px]">
        
        {/* Column 1: Chờ xử lý */}
        <div 
          className="flex flex-col rounded-2xl bg-cream border border-line p-4 min-h-[500px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'pending')}
        >
          <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#d99a4b]" />
              <h3 className="font-bold text-sm text-coffee">Chờ xử lý</h3>
            </div>
            <span className="rounded-full bg-beige px-2.5 py-0.5 text-xs font-bold text-coffee">
              {getColumnData('pending').length}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[550px] custom-scrollbar">
            {getColumnData('pending').map(order => (
              <OrderCard 
                key={order.delivery_id} 
                order={order} 
                isSla={isSlaBreached(order.created_at, order.status)}
                onDragStart={handleDragStart}
                onAssignClick={(id) => {
                  setAssigningId(id);
                  setSelectedShipperId('');
                }}
                onNextStatus={(id) => {
                  setAssigningId(id);
                  setSelectedShipperId('');
                }}
                nextBtnLabel="Gán Shipper"
              />
            ))}
            {getColumnData('pending').length === 0 && <EmptyColumn />}
          </div>
        </div>

        {/* Column 2: Đã phân công */}
        <div 
          className="flex flex-col rounded-2xl bg-cream border border-line p-4 min-h-[500px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'assigned')}
        >
          <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-500" />
              <h3 className="font-bold text-sm text-coffee">Đã phân công</h3>
            </div>
            <span className="rounded-full bg-beige px-2.5 py-0.5 text-xs font-bold text-coffee">
              {getColumnData('assigned').length}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[550px] custom-scrollbar">
            {getColumnData('assigned').map(order => (
              <OrderCard 
                key={order.delivery_id} 
                order={order} 
                isSla={isSlaBreached(order.created_at, order.status)}
                onDragStart={handleDragStart}
                onAssignClick={(id) => {
                  setAssigningId(id);
                  setSelectedShipperId(order.delivery_employee?.id || '');
                }}
                onNextStatus={(id) => handleStatusChange(id, 'on_the_way')}
                nextBtnLabel="Xuất phát"
              />
            ))}
            {getColumnData('assigned').length === 0 && <EmptyColumn />}
          </div>
        </div>

        {/* Column 3: Đang giao */}
        <div 
          className="flex flex-col rounded-2xl bg-cream border border-line p-4 min-h-[500px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'on_the_way')}
        >
          <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-latte" />
              <h3 className="font-bold text-sm text-coffee">Đang giao</h3>
            </div>
            <span className="rounded-full bg-beige px-2.5 py-0.5 text-xs font-bold text-coffee">
              {getColumnData('on_the_way').length}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[550px] custom-scrollbar">
            {getColumnData('on_the_way').map(order => (
              <OrderCard 
                key={order.delivery_id} 
                order={order} 
                isSla={isSlaBreached(order.created_at, order.status)}
                onDragStart={handleDragStart}
                onNextStatus={(id) => handleStatusChange(id, 'delivered')}
                onFailStatus={(id) => setFailDialogId(id)}
                nextBtnLabel="Đã giao"
                showFailBtn
              />
            ))}
            {getColumnData('on_the_way').length === 0 && <EmptyColumn />}
          </div>
        </div>

        {/* Column 4: Lịch sử đơn */}
        <div 
          className="flex flex-col rounded-2xl bg-cream border border-line p-4 min-h-[500px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'history')}
        >
          <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#5fa876]" />
              <h3 className="font-bold text-sm text-coffee">Đã kết thúc</h3>
            </div>
            <span className="rounded-full bg-beige px-2.5 py-0.5 text-xs font-bold text-coffee">
              {getColumnData('history').length}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[550px] custom-scrollbar">
            {getColumnData('history').map(order => (
              <OrderCard 
                key={order.delivery_id} 
                order={order} 
                isSla={false}
                onDragStart={handleDragStart}
              />
            ))}
            {getColumnData('history').length === 0 && <EmptyColumn />}
          </div>
        </div>

      </div>

      {/* Gán Shipper Dialog Modal */}
      {assigningId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee/60 p-4">
          <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-coffee mb-4">Phân công Shipper</h3>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-coffee mb-2">Chọn nhân viên giao hàng</label>
                <select
                  className="w-full h-10 rounded-lg border border-line bg-white px-3 text-sm focus:ring-2 focus:ring-latte"
                  value={selectedShipperId}
                  onChange={(e) => setSelectedShipperId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn Shipper --</option>
                  {shippers.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.phone})</option>
                  ))}
                </select>
                {shippers.length === 0 && (
                  <p className="mt-1.5 text-xs text-[#c25a5a] font-medium flex items-center gap-1">
                    <AlertCircle className="size-3.5" />
                    Chưa có nhân viên nào có vai trò Shipper trong chi nhánh.
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningId(null)}
                  className="h-10 px-4 rounded-xl border border-line text-sm font-semibold text-muted hover:bg-beige transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!selectedShipperId}
                  className="h-10 px-5 rounded-xl bg-coffee text-white text-sm font-semibold hover:bg-coffee/90 disabled:opacity-50 transition"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Giao hàng thất bại Dialog Modal */}
      {failDialogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee/60 p-4">
          <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-coffee mb-4">Báo cáo Giao hàng thất bại</h3>
            <form onSubmit={handleFailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-coffee mb-2">Lý do thất bại</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: Gọi điện thoại khách thuê bao 5 lần..."
                  className="w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-latte"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFailDialogId(null)}
                  className="h-10 px-4 rounded-xl border border-line text-sm font-semibold text-muted hover:bg-beige transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
                >
                  Xác nhận thất bại
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

// Order Card Component inside Column
function OrderCard({ 
  order, 
  isSla, 
  onDragStart,
  onAssignClick,
  onNextStatus,
  onFailStatus,
  nextBtnLabel,
  showFailBtn
}: { 
  order: DeliveryOrder; 
  isSla: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onAssignClick?: (id: string) => void;
  onNextStatus?: (id: string) => void;
  onFailStatus?: (id: string) => void;
  nextBtnLabel?: string;
  showFailBtn?: boolean;
}) {
  const formatCOD = (val: number) => {
    if (val === 0) return 'Đã thanh toán';
    return `COD: ₫${val.toLocaleString('vi-VN')}`;
  };

  const getStatusTag = (status: string) => {
    if (status === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#e6f4ea] px-2 py-0.5 text-[10px] font-bold text-[#137333]">
          <CheckCircle2 className="size-3" /> Thành công
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
          <XCircle className="size-3" /> Thất bại
        </span>
      );
    }
    return null;
  };

  const codeLabel = `#DLV-${order.order_id.slice(-4).toUpperCase()}`;
  const d = new Date(order.created_at);
  const timeLabel = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  const isTerminal = order.status === 'delivered' || order.status === 'failed';

  return (
    <div 
      draggable={!isTerminal}
      onDragStart={(e) => {
        if (isTerminal) {
          e.preventDefault();
          return;
        }
        onDragStart(e, order.delivery_id);
      }}
      className={cn(
        isTerminal ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        "p-4 rounded-xl border border-line bg-white shadow-sm hover:shadow-md transition-all space-y-3",
        isSla && "border-red-500 bg-red-50/20"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-bold", isSla ? "text-red-600" : "text-coffee")}>
          {codeLabel}
        </span>
        <div className="flex items-center gap-2">
          {isSla && (
            <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
              SLA Trễ
            </span>
          )}
          <span className="text-[11px] text-muted font-semibold flex items-center gap-1">
            <Clock className="size-3" />
            {timeLabel}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-2 text-sm font-bold text-coffee">
          <User className="size-3.5 text-latte shrink-0" />
          <span>{order.customer_name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <Phone className="size-3.5 text-latte shrink-0" />
          <a href={`tel:${order.customer_phone}`} className="hover:underline hover:text-coffee transition-colors">
            {order.customer_phone}
          </a>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted leading-relaxed">
          <MapPin className="size-3.5 text-latte shrink-0 mt-0.5" />
          <span className="line-clamp-2">{order.delivery_address}</span>
        </div>
      </div>

      {/* Payment / COD */}
      <div className="flex items-center justify-between pt-1 border-t border-dashed border-line">
        <span className={cn(
          "text-xs font-bold",
          order.total_amount_to_collect === 0 ? "text-[#5fa876]" : "text-[#d99a4b]"
        )}>
          {formatCOD(order.total_amount_to_collect)}
        </span>
        {getStatusTag(order.status)}
      </div>

      {/* Shipper Actions or Info */}
      <div className="pt-2 border-t border-line flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid size-6 place-items-center rounded-full bg-beige text-[10px] font-bold text-coffee shrink-0">
            {order.delivery_employee ? order.delivery_employee.name.charAt(0) : '?'}
          </span>
          <span className="text-xs font-semibold text-coffee truncate">
            {order.delivery_employee ? order.delivery_employee.name.replace('M4 - Shipper ', '') : 'Chưa gán shipper'}
          </span>
        </div>
        
        {/* Buttons / Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {order.status === 'pending' && onAssignClick && (
            <button
              onClick={() => onAssignClick(order.delivery_id)}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-beige text-coffee hover:bg-latte hover:text-white transition flex items-center gap-1"
            >
              <UserCheck className="size-3" /> Gán
            </button>
          )}

          {order.status === 'assigned' && onAssignClick && (
            <button
              onClick={() => onAssignClick(order.delivery_id)}
              className="p-1 rounded-lg hover:bg-beige text-muted hover:text-coffee transition-colors"
              title="Đổi Shipper"
            >
              <RotateCcw className="size-3.5" />
            </button>
          )}

          {onNextStatus && nextBtnLabel && (
            <button
              onClick={() => onNextStatus(order.delivery_id)}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-coffee text-white hover:opacity-90 transition flex items-center gap-0.5"
            >
              <span>{nextBtnLabel}</span>
              <ChevronRight className="size-3" />
            </button>
          )}

          {showFailBtn && onFailStatus && (
            <button
              onClick={() => onFailStatus(order.delivery_id)}
              className="p-1 rounded-lg hover:bg-red-50 text-red-600 transition"
              title="Thất bại"
            >
              <XCircle className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty column state helper component
function EmptyColumn() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted/60 border-2 border-dashed border-line rounded-xl">
      <Truck className="size-7 stroke-[1.5]" />
      <span className="mt-2 text-xs font-semibold">Trống</span>
    </div>
  );
}
