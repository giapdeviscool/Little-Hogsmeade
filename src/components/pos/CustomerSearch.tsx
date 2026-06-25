import { useState, useEffect } from 'react';
import { Search, X, User, Plus } from 'lucide-react';
import { searchCustomerByPhone } from '@/api/customer.api';
import type { Customer } from '@/types/customer.types';
import { CustomerQuickAddModal } from './CustomerQuickAddModal';

interface CustomerSearchProps {
  customer: Customer | null;
  onSelect: (customer: Customer) => void;
  onClear: () => void;
}

export function CustomerSearch({ customer, onSelect, onClear }: CustomerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchCustomerByPhone(query);
        const data = Array.isArray(res.data) ? res.data : (res as any);
        setResults(Array.isArray(data) ? data : []);
        setIsOpen(true);
      } catch (err) {
        console.error('Failed to search customer', err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (customer) {
    return (
      <div className="flex items-center justify-between p-2 bg-cream rounded-lg border border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-coffee">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-coffee text-xs">{customer.fullName}</h3>
            <span className="text-[10px] text-muted">{customer.phone}</span>
          </div>
        </div>
        <button 
          onClick={onClear}
          className="w-6 h-6 flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const shouldShrink = query.length >= 10 && results.length === 0 && !loading;

  return (
    <div className="relative">
      <div className="flex items-center w-full transition-all duration-300">
        <div className={`relative transition-all duration-300 flex-1 ${shouldShrink ? 'max-w-[70%]' : 'max-w-full'}`}>
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm SĐT khách hàng (từ 3 số)..."
            className="w-full h-9 pl-8 pr-3 bg-white border border-line rounded-lg text-xs outline-none focus:border-coffee transition-colors"
          />
          {loading && <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-coffee border-t-transparent rounded-full animate-spin" />}
        </div>
        
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`bg-coffee text-white text-[11px] font-bold h-9 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 overflow-hidden shrink-0 ${
            shouldShrink ? 'w-[28%] opacity-100 ml-2 px-2' : 'w-0 opacity-0 ml-0 p-0 pointer-events-none'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm mới</span>
        </button>
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-line rounded-xl shadow-xl z-50 overflow-hidden">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onSelect(c);
                setQuery('');
                setIsOpen(false);
              }}
              className="w-full text-left p-3 hover:bg-beige transition-colors border-b border-line last:border-0 flex justify-between items-center"
            >
              <div>
                <div className="font-bold text-coffee text-sm">{c.fullName}</div>
                <div className="text-xs text-muted">{c.phone}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && !loading && query.length >= 3 && results.length === 0 && !shouldShrink && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-line rounded-xl shadow-xl z-50 p-4 text-center text-xs text-muted animate-fade-in">
          Không tìm thấy khách hàng
        </div>
      )}

      {/* Quick Add Customer Modal */}
      <CustomerQuickAddModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        phoneQuery={query}
        onSuccess={(newCustomer) => {
          onSelect(newCustomer);
          setQuery('');
          setIsOpen(false);
        }}
      />
    </div>
  );
}
