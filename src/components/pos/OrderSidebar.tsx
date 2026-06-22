import { useState } from 'react';
import { OrderTabs } from '@/components/pos/OrderTabs';
import { CartItem } from '@/components/pos/CartItem';
import { CartSummary } from '@/components/pos/CartSummary';

export function OrderSidebar() {
  const [cartItems] = useState([
    {
      id: '1',
      name: 'Cà Phê Trứng',
      note: '+ Thêm thạch sương sáo, Ít đường',
      price: '55.000₫',
      quantity: 1,
    },
    {
      id: '2',
      name: 'Croissant Bơ Pháp',
      note: 'Hâm nóng',
      price: '35.000₫',
      quantity: 1,
    },
    {
      id: '3',
      name: 'Latte Hạnh Nhân',
      note: 'Sữa hạt, Đá riêng',
      price: '130.000₫',
      quantity: 2,
    },
  ]);

  return (
    <aside className="w-[35%] bg-white shadow-xl flex flex-col z-10">
      <OrderTabs />
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
        {cartItems.map((item) => (
          <CartItem key={item.id} {...item} />
        ))}
      </div>
      <CartSummary />
    </aside>
  );
}
