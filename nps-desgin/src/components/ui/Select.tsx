import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const triggerClass =
  'w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-sm py-3 px-4 text-left flex items-center justify-between text-on-surface outline-none cursor-pointer transition-all hover:bg-surface-container-high appearance-none';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

interface SelectProps<T = string> {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Select<T extends string | number>({
  label,
  value,
  onChange,
  options,
  placeholder = '请选择',
  required,
  disabled,
  className = '',
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  const display = selected?.label ?? placeholder;

  return (
    <div className={className} ref={ref}>
      {label && (
        <label className="text-sm font-semibold mb-1.5 block text-on-surface">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
          className={`${triggerClass} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span className={selected ? 'text-on-surface' : 'text-outline'}>{display}</span>
          <ChevronDown
            size={16}
            className={`text-outline shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-lg py-1 max-h-60 overflow-auto">
            {options.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  opt.value === value
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
