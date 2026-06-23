import { useState } from 'react';
import { Trash2, X, Plus } from 'lucide-react';
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
}

export function OrderTabs({
  orders,
  activeOrderId,
  activeOrder,
  onAddOrder,
  onDeleteOrder,
  onChangeOrder,
  onSetCustomer
}: OrderTabsProps) {
  const [tabToDelete, setTabToDelete] = useState<string | null>(null);

  return (
    <>
      <div className="flex items-end px-4 pt-4 gap-1 bg-beige/50 border-b border-line overflow-x-auto custom-scrollbar">
        {orders.map(order => {
          const isActive = order.id === activeOrderId;
          return (
            <div 
              key={order.id}
              onClick={() => onChangeOrder(order.id)}
              className={`px-6 py-2.5 font-bold text-sm rounded-t-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap border-t border-x ${
                isActive 
                  ? 'bg-white text-coffee border-line active-tab-shadow -mb-[1px] py-3.5' 
                  : 'bg-beige text-muted border-transparent hover:bg-white/80'
              }`}
            >
              {order.title}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setTabToDelete(order.id);
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
        
        <button 
          onClick={onAddOrder}
          className="p-2.5 mb-2 ml-1 rounded-full hover:bg-white text-coffee transition-colors flex items-center justify-center shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 py-3 border-b border-line bg-white">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-2xl font-bold text-coffee">{activeOrder.title}</h2>
          </div>
          <button 
            onClick={() => setTabToDelete(activeOrder.id)}
            className="text-muted hover:text-red-500 w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-all"
            title="Xóa đơn hàng"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
        
        <CustomerSearch 
          customer={activeOrder.customer}
          onSelect={onSetCustomer}
          onClear={() => onSetCustomer(null)}
        />
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
