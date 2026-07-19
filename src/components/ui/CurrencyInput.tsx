import React, { useState, useEffect } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: number | string;
  onValueChange: (value: string) => void;
}

export function CurrencyInput({ value, onValueChange, className, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === '' || value === null || value === undefined || isNaN(Number(value))) {
      setDisplayValue('');
    } else {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (!isNaN(num)) {
        // Format the number with dots for thousands (vi-VN locale)
        setDisplayValue(num.toLocaleString('vi-VN'));
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-digit characters
    const val = e.target.value.replace(/[^0-9]/g, '');
    
    if (val === '') {
      setDisplayValue('');
      onValueChange('');
    } else {
      const num = parseInt(val, 10);
      setDisplayValue(num.toLocaleString('vi-VN'));
      onValueChange(num.toString());
    }
  };

  return (
    <input
      type="text"
      className={className}
      value={displayValue}
      onChange={handleChange}
      {...props}
    />
  );
}
