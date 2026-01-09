import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomDropdown = ({ options, value, onChange, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${theme === 'light'
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                    }`}
            >
                <span className="truncate uppercase tracking-wider">{selectedOption.label}</span>
                <ChevronDown size={14} className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute z-50 w-full mt-1 rounded-xl shadow-2xl border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 ${theme === 'light'
                    ? 'bg-white border-zinc-200 shadow-zinc-200/50'
                    : 'bg-[#1a1a1a]/90 border-white/10 shadow-black/50'
                    }`}>
                    <div className="p-1.5 space-y-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-bold transition-all ${value === option.value
                                    ? (theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400')
                                    : (theme === 'light' ? 'hover:bg-zinc-100 text-zinc-600' : 'hover:bg-white/5 text-zinc-400')
                                    }`}
                            >
                                <span className="uppercase tracking-wider">{option.label}</span>
                                {value === option.value && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
