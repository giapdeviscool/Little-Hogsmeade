import { useState } from 'react';
import { ProductCard } from '@/components/pos/ProductCard';

export function ProductGrid() {
  const [products] = useState([
    {
      id: '1',
      name: 'Cà Phê Trứng',
      category: 'Signature',
      price: '55.000₫',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCig3UIc_bdydYX1UImjZ_7nCLsN7pKcdciDhZqRTaOuAVQ3XipLbShBVgLED2JzmCUrIssUr7JrM8OqbZwcQ8GvSe8ZWgySFYekQWhAcOnXcm4PR6cpGPALr32bzKD8EkeiwOwkXyC52JFLMzUbOlMDA9EWLlWGcBGqK4Fl2bBEsiYdikL7kJSLmJXImXmx4W0CE8p-VdYWuwo-pQ_KRm2pNGMUcsQVJhcWIV37tDXRN0MEXOTxNzxdUyhi2CqLl4NJOxDEgww39h7',
      isBestSeller: true,
      outOfStock: false,
    },
    {
      id: '2',
      name: 'Latte Hạnh Nhân',
      category: 'Oat/Almond',
      price: '65.000₫',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfNeL_C843moutoEhimuLVyUe67VypNiolpIMldO5HlFWU1tHF0EIgDR-qmdGiz7RzFjDmJhLuIZAvI08XLYKjTL3x27sBzt2RYGJbNrCPqST8ZrA6h8NiiwrH5tTSvL19Hg-NBoeEIVLKdZk6kcw3iiSdLwXXI8x0zaQm9l7b_MGrZnd7MDBp8BHjaSIXDBxyGNN-LbT8a5ONShh354-7J2KjW2aBzxEiDu4l0BN_Ojx4SIe5CP72wLyhwLboANOgHPMfIcG0Gzs5',
      outOfStock: false,
    },
    {
      id: '3',
      name: 'Cold Brew Nguyên Bản',
      category: '24h Steeped',
      price: '49.000₫',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBkjjjVd6wPBcqg7kykyWuQkgtpsqldCl1CG_WCRrpe4Jc2nkpiCsReTMMuPq1BiMLyy5tuHwAOhMgdQhq952e9KM9lZ-sKDiw_vsVcspvMQ6J7AJ0ed0ivQ19Rp3Lv-CPhxDxy5Kuxg4zU4NL9hEEMhzfeA07uRKR3EBidZqKElSCgn4Ehwlnppi-48kkjJxJPhgoXl0FNQsKpYcoQxr45iu89GkofxURdds9aG7cNhr_Nn9PBHfZtiJtsMULbBT8puQLIvdRxyRH',
      outOfStock: false,
    },
    {
      id: '4',
      name: 'Croissant Bơ Pháp',
      category: 'Fresh Daily',
      price: '35.000₫',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHXn0hov7ocX5IxsuC8h8zAXz5WRIfScL46M-XzsXgIZVoMD1enYOgj9avIuPJ187s_1GINty6EeEc-tfDHoAx8e4KDEYM47UpiM_WeJuunJWkHS29dQrgYmgH2l9F5A86G1qqyhtLM5N_rupRjWIZo_USruDRKx2m6q3uYbU0rqiUGOROVunAsaEsZGX5sJFrnR3QTT_fm6vimDTysYKKw8cMvkaGXsky3Z9FKqCP76bGzwEFFLGNsjepAUl5YPfUJtyFgAexZrZX',
      outOfStock: false,
    },
    {
      id: '5',
      name: 'Uji Matcha Latte',
      category: 'Ceremonial Grade',
      price: '70.000₫',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYqRUQa2uvCu3k7ZHkP9vV8745nyIahwebvBWn_jMgiJ6F5T3MtPIcmp8IQPKBHF4CXTtisa7u-pPCtF5XuAOvAUoPuDTfHHtnlrCVUzD33J-ag_ZQGs2qc-C12MIbbcNG60bAnpezEchAlt_oLD6AIqJNb5Y9Tw26OxowKB4Zrjbs-vMCc3Skj-bpdcmW0zKvtGDlr57VcAalaw62xPh9dO0HPXV80gCu3hd4c_QohAwJ3jNCkdiMIFZHkQbqJ5NhxSQvIsYfgmgT',
      outOfStock: true,
    },
    {
      id: '6',
      name: 'Bánh Mì Bơ Trứng',
      category: 'Brunch',
      price: '95.000₫',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0BlQSNpxImIL2_te0rRkFR6ycmdZFzT34DuBLf779De3XR3JbUreX26X3_pEZSZPW-uh8Y6hG-MNj_iUocfvSyGueBBWR8IjDBbF1RiRFs0bSRXVYjpA4tCJMONdK4QDdm-0AtCU3JBcm2ziSuZFNieX6HB3tZ5JCV75CJlVKKw3INLPN3H6AP6P7596bHjTUVnNBmdPgI5FJAJE-bor4OMa52AHff_coHcBSorsUBP0-d1eqFwjyKmG4ngyeOpzPdOOAXs1z4j0F',
      outOfStock: false,
    },
  ]);

  return (
    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}
