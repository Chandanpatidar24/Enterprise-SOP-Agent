import React, { useState, useRef, useEffect } from 'react';
import { Menu, Database, ChevronDown, Check, Settings } from 'lucide-react';

// CustomDropdown component (merged from CustomDropdown.jsx)
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
                <div className={`absolute left-0 mt-2 min-w-[160px] w-max p-1.5 rounded-xl border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 ${theme === 'light'
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

// ChatHeader component
const ChatHeader = ({
    setIsSidebarOpen,
    selectedModel,
    setSelectedModel,
    currentUserRole,
    setView,
    theme
}) => {
    return (
        <>
            {/* Mobile Header */}
            <header className="flex items-center justify-between p-3 md:hidden z-10 sticky top-0">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                    <Menu size={20} />
                </button>
                <span className="font-semibold text-sm">OpsMind</span>
                <div className="w-8" />
            </header>

            {/* Desktop Header */}
            <div className={`hidden md:flex items-center justify-between px-4 py-3 absolute top-0 left-0 right-0 z-10 backdrop-blur-md border-b transition-colors duration-300 ${theme === 'light' ? 'bg-white/80 border-zinc-200' : 'bg-[#212121]/80 border-white/5'
                }`}>
                <div className="flex items-center gap-2 bg-transparent p-1 rounded-lg">
                    {/* Model Selector Dropdown */}
                    <CustomDropdown
                        options={[
                            { value: 'opsmind4', label: 'OpsMind 4' },
                            { value: 'opsmind42', label: 'OpsMind 4.2' },
                            { value: 'opsmind5', label: 'OpsMind 5' },
                        ]}
                        value={selectedModel}
                        onChange={setSelectedModel}
                        theme={theme}
                    />
                    {currentUserRole !== 'user' && (
                        <button
                            onClick={() => setView('admin')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'light'
                                ? 'text-zinc-600 hover:bg-zinc-100'
                                : 'text-zinc-400 hover:bg-[#2f2f2f]'
                                }`}
                        >
                            <Database size={16} />
                            <span className="hidden lg:inline">Knowledge Base</span>
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setView('settings')}
                    className={`p-2 rounded-lg transition-colors ${theme === 'light'
                        ? 'text-zinc-600 hover:bg-zinc-100'
                        : 'text-zinc-400 hover:bg-[#2f2f2f]'
                        }`}
                >
                    <Settings size={18} />
                </button>
            </div>
        </>
    );
};

export default ChatHeader;
