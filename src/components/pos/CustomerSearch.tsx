import { useState, useEffect } from 'react';
import { Search, X, User } from 'lucide-react';
import { searchCustomerByPhone } from '@/api/customer.api';
import type { Customer } from '@/types/customer.types';

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
      <div className="flex items-center justify-between p-3 bg-cream rounded-xl border border-line">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-coffee">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-coffee text-sm">{customer.fullName}</h3>
            {/* <p className="text-xs text-muted font-medium">{customer.phone} • {customer.totalPoints || 0} điểm</p> */}
          </div>
        </div>
        <button 
          onClick={onClear}
          className="w-8 h-8 flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm SĐT khách hàng (từ 3 số)..."
          className="w-full h-11 pl-9 pr-4 bg-white border border-line rounded-xl text-sm outline-none focus:border-coffee transition-colors"
        />
        {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-coffee border-t-transparent rounded-full animate-spin" />}
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
              <div className="text-xs font-bold text-gold bg-gold/10 px-2 py-1 rounded-lg">
                {/* {c.totalPoints || 0} đ */}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && !loading && query.length >= 3 && results.length === 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-line rounded-xl shadow-xl z-50 p-4 text-center text-sm text-muted">
          Không tìm thấy khách hàng
        </div>
      )}
    </div>
  );
}
