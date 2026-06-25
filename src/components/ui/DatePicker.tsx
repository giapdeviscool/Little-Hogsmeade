import { useState } from 'react';
import { cn } from '../../utils/cn';
import * as Popover from '@radix-ui/react-popover';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Chọn ngày" }: DatePickerProps) {
  const [currentDate, setCurrentDate] = useState(() => (value ? new Date(value) : new Date()));
  const [isOpen, setIsOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Days array
  const days: (Date | null)[] = [];
  // Empty slots before first day
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const displayValue = value ? (() => {
    const d = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  })() : "";

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button className="w-full bg-white border border-line rounded-xl px-4 h-12 text-sm text-coffee focus:ring-1 focus:ring-gold focus:border-gold outline-none transition-all flex items-center justify-between text-left hover:bg-cream/20 cursor-pointer">
          <span className={cn(displayValue ? "text-coffee" : "text-muted")}>
            {displayValue || placeholder}
          </span>
          <span className="material-symbols-outlined text-muted text-xl pointer-events-none">calendar_today</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content 
          className="bg-white rounded-2xl border border-line shadow-lg p-5 z-50 w-72 animate-in fade-in zoom-in-95 duration-150"
          align="start"
          sideOffset={8}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream/40 text-coffee cursor-pointer">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <span className="font-semibold text-coffee text-sm">
              {monthNames[month]} {year}
            </span>
            <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream/40 text-coffee cursor-pointer">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
            <span>CN</span>
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const isSelected = value && new Date(value).toDateString() === day.toDateString();
              const isToday = new Date().toDateString() === day.toDateString();
              
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "h-8 w-8 text-xs font-semibold rounded-lg flex items-center justify-center transition-colors cursor-pointer",
                    isSelected
                      ? "bg-coffee text-white font-bold"
                      : isToday
                        ? "bg-gold/10 text-gold font-bold border border-gold/30"
                        : "text-coffee hover:bg-cream"
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
