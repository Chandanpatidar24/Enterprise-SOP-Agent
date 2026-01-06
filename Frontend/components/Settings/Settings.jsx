import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Lock, ChevronDown, Trash2, Shield, Users, Cpu, LogOut, Check } from 'lucide-react';

// CustomDropdown component (inline)
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

const Settings = ({
    t,
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    language,
    setLanguage,
    accentMap,
    setView,
    setUsersList,
    token,
    onLogout
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        if (!confirm(t.deleteAccountConfirm || "Are you sure you want to permanently delete your account? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("Your account has been successfully deleted.");
                onLogout();
            } else {
                const data = await response.json();
                alert(data.message || "Failed to delete account.");
            }
        } catch (error) {
            console.error("Account deletion error:", error);
            alert("An error occurred while deleting your account.");
        } finally {
            setIsDeleting(false);
        }
    };
    return (
        <div className="flex-1 overflow-y-auto flex justify-center p-4 pt-16">
            <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 mb-20">
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <button onClick={() => setView('chat')} className="p-2 hover:bg-white/5 rounded-full"><ArrowLeft /></button>
                    <h2 className="text-3xl font-bold">{t.settings}</h2>
                </div>

                {/* Profile Settings */}
                <section>
                    <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">{t.profile}</h3>
                    <div className={`p-4 rounded-xl border space-y-4 ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#171717] border-white/10'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${accentMap[accentColor]}`}>
                                {userName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-zinc-500 block mb-1">{t.displayName}</label>
                                <input
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className={`w-full bg-transparent border-b ${theme === 'light' ? 'border-zinc-200 text-zinc-900' : 'border-zinc-700 text-white'} py-1 outline-none focus:border-blue-500 transition-colors`}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 block mb-1">{t.emailAddress}</label>
                            <input
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className={`w-full bg-transparent border-b ${theme === 'light' ? 'border-zinc-200 text-zinc-900' : 'border-zinc-700 text-white'} py-1 outline-none focus:border-blue-500 transition-colors`}
                            />
                        </div>
                    </div>
                </section>

                {/* Appearance */}
                <section>
                    <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">{t.appearance}</h3>
                    <div className={`p-1 rounded-xl border ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#171717] border-white/10'}`}>
                        {/* Theme */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <div>
                                <div className="font-medium mt-1">{t.themePreference}</div>
                                <div className="text-sm text-zinc-500">{t.themeSub}</div>
                            </div>
                            <CustomDropdown
                                theme={theme}
                                value={theme}
                                onChange={setTheme}
                                options={[
                                    { value: 'dark', label: 'Dark Mode' },
                                    { value: 'light', label: 'Light Mode' }
                                ]}
                            />
                        </div>

                        {/* Accent Color */}
                        <div className="flex items-center justify-between p-4">
                            <div>
                                <div className="font-medium">{t.accentColor}</div>
                                <div className="text-sm text-zinc-500">{t.accentSub}</div>
                            </div>
                            <div className="flex gap-2">
                                {['blue', 'purple', 'green', 'orange'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setAccentColor(c)}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${accentMap[c]} ${accentColor === c ? 'border-white' : 'border-transparent'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>



                {/* Language */}
                <section>
                    <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">{t.regional}</h3>
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#171717] border-white/10'}`}>
                        <div>
                            <div className="font-medium">{t.language}</div>
                            <div className="text-sm text-zinc-500">{t.languageSub}</div>
                        </div>
                        <CustomDropdown
                            theme={theme}
                            value={language}
                            onChange={setLanguage}
                            options={[
                                { value: 'en', label: 'English (US)' },
                                { value: 'es', label: 'Spanish' },
                                { value: 'fr', label: 'French' },
                                { value: 'de', label: 'German' },
                                { value: 'ja', label: 'Japanese' }
                            ]}
                        />
                    </div>
                </section>

                {/* Account Actions */}
                <section>
                    <h3 className="text-sm font-medium text-red-400 mb-3 uppercase tracking-wider">{t.dangerZone}</h3>
                    <div className={`p-1 rounded-xl border ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#171717] border-white/10'}`}>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className={`w-full flex items-center justify-between p-4 transition-all rounded-lg group mb-1 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'light' ? 'text-zinc-700 hover:bg-red-50 hover:text-red-600' : 'text-zinc-200 hover:bg-red-500/10 hover:text-red-400'}`}
                        >
                            <div className="text-left">
                                <div className="font-medium">{isDeleting ? 'Deleting...' : t.deleteAccount}</div>
                                <div className="text-sm opacity-70">{t.deleteAccountSub}</div>
                            </div>
                            <Trash2 size={18} />
                        </button>
                        <button
                            onClick={onLogout}
                            className={`w-full flex items-center justify-between p-4 transition-all rounded-lg group ${theme === 'light' ? 'text-zinc-700 hover:bg-red-50 hover:text-red-600' : 'text-zinc-200 hover:bg-red-500/10 hover:text-red-400'}`}
                        >
                            <div className="text-left">
                                <div className="font-medium">Log Out</div>
                                <div className="text-sm opacity-70">Sign out of your session</div>
                            </div>
                            <LogOut size={18} />
                        </button>
                    </div>
                </section>

                <div className="text-center text-xs text-zinc-600 pt-8">
                    {t.footer}
                </div>
            </div>
        </div>
    );
};

export default Settings;
