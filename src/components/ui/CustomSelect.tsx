import * as Select from '@radix-ui/react-select';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = "Chọn giá trị" }: CustomSelectProps) {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="w-full bg-white border border-line rounded-xl px-4 h-12 text-sm text-coffee focus:ring-1 focus:ring-gold focus:border-gold outline-none transition-all flex items-center justify-between text-left hover:bg-cream/20 cursor-pointer">
        <Select.Value placeholder={placeholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </Select.Value>
        <Select.Icon>
          <span className="material-symbols-outlined text-muted text-xl pointer-events-none">expand_more</span>
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="bg-white border border-line rounded-2xl shadow-lg z-50 overflow-hidden min-w-[200px] animate-in fade-in slide-in-from-top-1 duration-100">
          <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-cream/40 text-coffee cursor-default">
            <span className="material-symbols-outlined text-sm">chevron_up</span>
          </Select.ScrollUpButton>
          <Select.Viewport className="p-2">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="text-sm text-coffee font-medium px-4 py-2.5 rounded-xl hover:bg-cream/40 outline-none cursor-pointer flex items-center justify-between data-[state=checked]:bg-beige/40 data-[state=checked]:font-semibold select-none"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <span className="material-symbols-outlined text-gold text-sm">check</span>
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-cream/40 text-coffee cursor-default">
            <span className="material-symbols-outlined text-sm">chevron_down</span>
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
