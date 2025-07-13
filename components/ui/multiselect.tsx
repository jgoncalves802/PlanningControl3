import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange, placeholder = 'Selecione...', icon }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={`w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent ${open ? 'ring-2 ring-primary' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {icon}
          {value.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <div className="flex gap-1 flex-wrap">
              {value.map(val => {
                const opt = options.find(o => o.value === val);
                return opt ? (
                  <span key={val} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    {opt.label}
                    <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" onClick={e => { e.stopPropagation(); toggleOption(val); }}>
                      ×
                    </button>
                  </span>
                ) : null;
              })}
              <button type="button" className="ml-2 text-xs text-gray-500 hover:text-red-600" onClick={clearAll}>Limpar</button>
            </div>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-50">
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
                className="form-checkbox rounded text-primary focus:ring-primary mr-2"
              />
              <span className="flex-1 text-sm">{opt.label}</span>
              {value.includes(opt.value) && <Check className="h-4 w-4 text-primary ml-2" />}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}; 