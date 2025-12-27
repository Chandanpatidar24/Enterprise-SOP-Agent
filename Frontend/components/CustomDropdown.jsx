import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomDropdown = ({ options, value, onChange, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-sm font-medium ${theme === 'light'
                    ? 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:border-zinc-600'
                    }`}
            >
                {selectedLabel}
                <ChevronDown size={14} className={`opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute right-0 mt-2 w-48 p-1.5 rounded-xl border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 ${theme === 'light'
                    ? 'bg-white border-zinc-100 shadow-zinc-200/50'
                    : 'bg-[#1f1f1f] border-zinc-700 shadow-black/50'
                    }`}>
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-all mb-0.5 last:mb-0 ${value === opt.value
                                ? (theme === 'light' ? 'bg-zinc-100 text-zinc-900 font-medium' : 'bg-white/10 text-white font-medium')
                                : (theme === 'light' ? 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200')
                                }`}
                        >
                            {opt.label}
                            {value === opt.value && <Check size={14} className={theme === 'light' ? 'text-black' : 'text-white'} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
