import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function Dropdown({ options, selected, onChange, className = '', showIcons = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const Icon = showIcons ? selected?.icon : null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[12px] font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 shadow-sm max-w-[160px]"
      >
        {Icon && <Icon className="h-3.5 w-3.5 text-gray-500 shrink-0" />}
        <span className="truncate flex-1 text-left">{selected?.name}</span>
        <ChevronDown className={`h-3 w-3 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-3 w-[240px] rounded-2xl border border-gray-200/80 bg-white p-2 shadow-xl">
          {options.map((option) => {
            const isSelected = selected?.id === option.id;
            const Icon = showIcons ? option.icon : null;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                  isSelected ? 'bg-gray-50' : 'hover:bg-gray-50/60'
                }`}
              >
                {Icon && (
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isSelected ? 'bg-[#84cc16]/15 text-[#65a30d]' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon size={18} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[13px] font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                      {option.name}
                    </span>
                    {option.badge && (
                      <span className="rounded-md bg-lime-100 border border-lime-200 px-1.5 py-0.5 text-[9px] font-bold italic text-lime-800">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  {option.desc && (
                    <div className="text-[11px] text-gray-400 mt-0.5">{option.desc}</div>
                  )}
                </div>

                {isSelected && <Check size={16} className="shrink-0 text-[#65a30d]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
