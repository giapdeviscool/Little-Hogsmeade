import { cn } from '../../utils/cn';

interface RecordPaginationProps {
  currentPage: number;
  pageSize: number;
  totalDocs: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  label?: string;
}

export function RecordPagination({
  currentPage,
  pageSize,
  totalDocs,
  totalPages,
  loading = false,
  onPageChange,
  label = "giao dịch"
}: RecordPaginationProps) {
  // Page selection list helper
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();
  const startRecord = totalDocs > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalDocs);

  return (
    <div className="px-4 py-4 bg-beige/20 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <p className="text-sm text-muted">
        Hiển thị <span className="font-bold text-coffee">{startRecord} - {endRecord}</span> trên tổng số <span className="font-bold text-coffee">{totalDocs}</span> {label}
      </p>
      <div className="flex items-center gap-1">
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-latte/10 text-muted disabled:opacity-30 cursor-pointer" 
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || loading}
          type="button"
        >
          <span className="material-symbols-outlined text-xl">first_page</span>
        </button>
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-latte/10 text-muted disabled:opacity-30 cursor-pointer" 
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1 || loading}
          type="button"
        >
          <span className="material-symbols-outlined text-xl">chevron_left</span>
        </button>

        {pages.map((p, idx) => {
          if (p === '...') {
            return <span key={`dots-${idx}`} className="px-2 text-muted select-none">...</span>;
          }
          const isCurrent = p === currentPage;
          return (
            <button
              key={`page-${p}`}
              onClick={() => onPageChange(p as number)}
              disabled={loading}
              type="button"
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer",
                isCurrent 
                  ? "bg-coffee text-white font-bold shadow-sm" 
                  : "hover:bg-latte/10"
              )}
            >
              {p}
            </button>
          );
        })}

        <button 
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-latte/10 text-muted disabled:opacity-30 cursor-pointer" 
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages || loading}
          type="button"
        >
          <span className="material-symbols-outlined text-xl">chevron_right</span>
        </button>
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-latte/10 text-muted disabled:opacity-30 cursor-pointer" 
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
          type="button"
        >
          <span className="material-symbols-outlined text-xl">last_page</span>
        </button>
      </div>
    </div>
  );
}
