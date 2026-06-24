import { useState } from 'react';
import { Trash2, X, Plus, Store, ShoppingBag, Truck } from 'lucide-react';
import type { OrderType } from '@/pages/pos/index';
import type { Customer } from '@/types/customer.types';
import { CustomerSearch } from '@/components/pos/CustomerSearch';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface OrderTabsProps {
  orders: OrderType[];
  activeOrderId: string;
  activeOrder: OrderType;
  onAddOrder: () => void;
  onDeleteOrder: (id: string) => void;
  onChangeOrder: (id: string) => void;
  onSetCustomer: (customer: Customer | null) => void;
  onSetOrderType: (type: 'dine-in' | 'takeaway' | 'delivery') => void;
}

export function OrderTabs({
  orders,
  activeOrderId,
  activeOrder,
  onAddOrder,
  onDeleteOrder,
  onChangeOrder,
  onSetCustomer,
  onSetOrderType
}: OrderTabsProps) {
  const [tabToDelete, setTabToDelete] = useState<string | null>(null);

  return (
    <>
      <div className="flex items-end px-3 pt-3 gap-0.5 bg-beige/50 border-b border-line overflow-x-auto custom-scrollbar">
        {orders.map(order => {
          const isActive = order.id === activeOrderId;
          return (
            <div 
              key={order.id}
              onClick={() => onChangeOrder(order.id)}
              className={`px-4 py-2 font-bold text-xs rounded-t-lg flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap border-t border-x ${
                isActive 
                  ? 'bg-white text-coffee border-line active-tab-shadow -mb-[1px] py-2.5' 
                  : 'bg-beige text-muted border-transparent hover:bg-white/80'
              }`}
            >
              {order.title}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setTabToDelete(order.id);
                }}
                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
        
        <button 
          onClick={onAddOrder}
          className="p-2 mb-1.5 ml-1 rounded-full hover:bg-white text-coffee transition-colors flex items-center justify-center shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-2 border-b border-line bg-white">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-lg font-bold text-coffee">{activeOrder.title}</h2>
          </div>
          <button 
            onClick={() => setTabToDelete(activeOrder.id)}
            className="text-muted hover:text-red-500 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-all"
            title="Xóa đơn hàng"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
        
        <CustomerSearch 
          customer={activeOrder.customer}
          onSelect={onSetCustomer}
          onClear={() => onSetCustomer(null)}
        />

        <div className="flex gap-1.5 mt-3">
          <button
            onClick={() => onSetOrderType('dine-in')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
              activeOrder.orderType === 'dine-in'
                ? 'bg-coffee text-white shadow-md'
                : 'bg-beige text-muted hover:bg-line/50 border border-transparent'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Tại bàn
          </button>
          <button
            onClick={() => onSetOrderType('takeaway')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
              activeOrder.orderType === 'takeaway'
                ? 'bg-coffee text-white shadow-md'
                : 'bg-beige text-muted hover:bg-line/50 border border-transparent'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Mang đi
          </button>
          <button
            onClick={() => onSetOrderType('delivery')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
              activeOrder.orderType === 'delivery'
                ? 'bg-coffee text-white shadow-md'
                : 'bg-beige text-muted hover:bg-line/50 border border-transparent'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Giao hàng
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!tabToDelete}
        title="Xác nhận xoá đơn hàng"
        message="Bạn có chắc chắn muốn xoá đơn hàng này không? Hành động này không thể hoàn tác."
        confirmText="Xoá đơn hàng"
        onConfirm={() => {
          if (tabToDelete) onDeleteOrder(tabToDelete);
          setTabToDelete(null);
        }}
        onCancel={() => setTabToDelete(null)}
      />
    </>
  );
}
