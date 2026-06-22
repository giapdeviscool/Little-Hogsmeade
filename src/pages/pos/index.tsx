import { PosLayout } from '../../layouts/PosLayout';
import { ProductSection } from '../../components/pos/ProductSection';
import { OrderSidebar } from '../../components/pos/OrderSidebar';

export function PosPage() {
  return (
    <PosLayout>
      <ProductSection />
      <OrderSidebar />
    </PosLayout>
  );
}
