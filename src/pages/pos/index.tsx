import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getShiftId } from '@/store/shift.store';
import { PosLayout } from '@/layouts/PosLayout';
import { ProductSection } from '@/components/pos/ProductSection';
import { OrderSidebar } from '@/components/pos/OrderSidebar';
import { Plus, ShoppingCart } from 'lucide-react';
import type { MenuItem } from '@/types/menu.types';
import type { Customer } from '@/types/customer.types';
import { ToppingSelectionModal } from '@/components/pos/ToppingSelectionModal';
import type { SelectedTopping } from '@/components/pos/ToppingSelectionModal';

export interface CartItemType {
  id: string;
  name: string;
  note: string;
  price: string;
  quantity: number;
  toppings?: SelectedTopping[];
}

export interface OrderType {
  id: string;
  title: string;
  customer: Customer | null;
  cartItems: CartItemType[];
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  deliveryInfo?: {
    receiverName: string;
    receiverPhone: string;
    deliveryAddress: string;
    deliveryFee: number;
    distance?: number;
    note?: string;
  };
}

export function PosPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const activeShiftId = getShiftId();
    if (!activeShiftId) {
      navigate(ROUTES.shiftOpening);
    }
  }, [navigate]);

  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [orders, setOrders] = useState<OrderType[]>([
    { id: '1', title: 'Đơn mới #1', customer: null, cartItems: [], orderType: 'dine-in' }
  ]);
  const [activeOrderId, setActiveOrderId] = useState<string>('1');
  const [customizingItem, setCustomizingItem] = useState<{
    itemId: string;
    itemName: string;
    initialToppings: SelectedTopping[];
  } | null>(null);

  const activeOrder = orders.find(o => o.id === activeOrderId) || orders[0];

  // Update quantity of a cart item (delta can be +1 or -1)
  const handleUpdateItem = (itemId: string, delta: number) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== activeOrderId) return order;
        const updatedItems = order.cartItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        );
        return { ...order, cartItems: updatedItems };
      })
    );
  };

  // Remove an item from the current order
  const handleRemoveItem = (itemId: string) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== activeOrderId) return order;
        const filtered = order.cartItems.filter(item => item.id !== itemId);
        return { ...order, cartItems: filtered };
      })
    );
  };

  const handleProductClick = (product: MenuItem) => {
    if (!isOrderOpen) setIsOrderOpen(true);
    
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id !== activeOrderId) return order;
      
      const existing = order.cartItems.find(item => item.id === product.id);
      let newCartItems;
      if (existing) {
        newCartItems = order.cartItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        newCartItems = [...order.cartItems, {
          id: product.id,
          name: product.name,
          price: `₫${product.basePrice.toLocaleString('vi-VN')}`,
          note: '',
          quantity: 1,
        }];
      }
      return { ...order, cartItems: newCartItems };
    }));
  };

  const handleAddOrder = () => {
    const newId = Date.now().toString();
    const newOrder: OrderType = {
      id: newId,
      title: `Đơn mới #${orders.length + 1}`,
      customer: null,
      cartItems: [],
      orderType: 'dine-in'
    };
    setOrders(prev => [...prev, newOrder]);
    setActiveOrderId(newId);
    setIsOrderOpen(true);
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(prev => {
      const filtered = prev.filter(o => o.id !== id);
      if (filtered.length === 0) {
        const newId = Date.now().toString();
        setActiveOrderId(newId);
        return [{ id: newId, title: 'Đơn mới #1', customer: null, cartItems: [], orderType: 'dine-in' }];
      }
      if (activeOrderId === id) {
        setActiveOrderId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
  };

  const handleClearOrder = () => {
    setOrders(prev => prev.map(o => 
      o.id === activeOrderId 
        ? { ...o, cartItems: [], customer: o.customer?.isNew ? null : o.customer } 
        : o
    ));
  };

  const handleSetCustomer = (customer: Customer | null) => {
    setOrders(prev => prev.map(o => 
      o.id === activeOrderId ? { ...o, customer } : o
    ));
  };

  const handleSetOrderType = (orderType: 'dine-in' | 'takeaway' | 'delivery') => {
    setOrders(prev => prev.map(o => 
      o.id === activeOrderId ? { ...o, orderType } : o
    ));
  };

  const handleUpdateDeliveryInfo = (info: Partial<NonNullable<OrderType['deliveryInfo']>>) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== activeOrderId) return o;
      const defaultInfo = {
        receiverName: o.customer?.fullName || '',
        receiverPhone: o.customer?.phone || '',
        deliveryAddress: '',
        deliveryFee: 0,
        distance: 0,
        note: ''
      };
      return {
        ...o,
        deliveryInfo: {
          ...(o.deliveryInfo || defaultInfo),
          ...info
        }
      };
    }));
  };

  return (
    <PosLayout>
      <div className="flex w-full h-full overflow-hidden bg-beige">
        <ProductSection 
          isOrderOpen={isOrderOpen} 
          onProductClick={handleProductClick} 
        />
        
        {/* Order panel as a flex sibling — auto-resizes the menu */}
        <div 
          className={`h-full bg-white flex flex-col border-l border-line transition-all duration-300 overflow-hidden ${
            isOrderOpen ? 'w-[38%] shadow-xl' : 'w-[60px] items-center py-5'
          }`}
        >
          {isOrderOpen ? (
            <OrderSidebar 
              orders={orders}
              activeOrderId={activeOrderId}
              activeOrder={activeOrder}
              onClose={() => setIsOrderOpen(false)}
              onAddOrder={handleAddOrder}
              onDeleteOrder={handleDeleteOrder}
              onChangeOrder={setActiveOrderId}
              onSetCustomer={handleSetCustomer}
              onSetOrderType={handleSetOrderType}
              onUpdateDeliveryInfo={handleUpdateDeliveryInfo}
              onClearOrder={handleClearOrder}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={handleRemoveItem}
              onCustomizeItem={(itemId) => {
                const item = activeOrder.cartItems.find(i => i.id === itemId);
                if (item) {
                  setCustomizingItem({
                    itemId: item.id,
                    itemName: item.name,
                    initialToppings: item.toppings || []
                  });
                }
              }}
            />
          ) : (
            <div className="flex flex-col gap-2.5 mt-3 items-center">
              <button 
                onClick={() => setIsOrderOpen(true)}
                className="w-9 h-9 bg-white text-coffee border border-line rounded-full flex items-center justify-center hover:bg-beige transition-colors shadow-sm relative"
                title="Mở đơn hiện tại"
              >
                <ShoppingCart className="w-4 h-4" />
                {activeOrder.cartItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {activeOrder.cartItems.length}
                  </span>
                )}
              </button>
              <button 
                onClick={handleAddOrder}
                className="w-9 h-9 bg-coffee text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                title="Tạo đơn mới"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      {customizingItem && (
        <ToppingSelectionModal
          isOpen={true}
          onClose={() => setCustomizingItem(null)}
          menuItemId={customizingItem.itemId}
          menuItemName={customizingItem.itemName}
          initialToppings={customizingItem.initialToppings}
          onConfirm={(selectedToppings) => {
            setOrders(prev => prev.map(order => {
              if (order.id !== activeOrderId) return order;
              const updatedItems = order.cartItems.map(item =>
                item.id === customizingItem.itemId
                  ? { ...item, toppings: selectedToppings }
                  : item
              );
              return { ...order, cartItems: updatedItems };
            }));
          }}
        />
      )}
    </PosLayout>
  );
}
