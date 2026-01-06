import React from 'react';
import { Plus, X, Loader2, SendHorizontal, FileCheck, User, AlertCircle, Settings, Sparkles, Briefcase } from 'lucide-react';

// ==================== SIDEBAR COMPONENT ====================
export const Sidebar = ({
    isSidebarOpen,
    setIsSidebarOpen,
    handleNewChat,
    sessions,
    activeChatId,
    handleSessionClick,
    userName,
    isProfileOpen,
    setIsProfileOpen,
    theme,
    t,
    userRole,
    onLogout,
    onUpgradeClick,
    onManagePlan
}) => {
    return (
        <aside
            className={`${isSidebarOpen ? 'w-[260px] translate-x-0' : 'w-0 -translate-x-full'
                } ${theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-[#171717]'} transition-all duration-300 ease-in-out flex flex-col fixed md:relative z-30 h-full overflow-hidden shrink-0 border-r border-white/5`}
        >
            <div className="p-3 flex flex-col h-full">
                {/* Mobile Close */}
                <div className="md:hidden flex justify-end pb-2">
                    <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-400 p-2"><X size={20} /></button>
                </div>

                {/* New Chat Button */}
                <button
                    onClick={handleNewChat}
                    className={`flex items-center gap-2 w-full px-3 py-3 rounded-lg border text-sm transition-all shadow-sm mb-4 group ${theme === 'light'
                        ? 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                        : 'bg-transparent hover:bg-[#212121] text-white border-white/20'
                        }`}
                >
                    <div className="p-1 bg-white text-black rounded-full"><Plus size={14} /></div>
                    <span className="font-medium">{t.newChat}</span>
                </button>

                <div className="flex-1 overflow-y-auto -mx-2 px-2 custom-scrollbar">
                    <div className="px-2 py-2 text-xs font-medium text-zinc-500 mb-2">{t.today}</div>
                    <div className="space-y-1">
                        {sessions.map((item) => (
                            <button
                                key={item._id}
                                onClick={() => handleSessionClick(item._id)}
                                className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-colors text-left truncate group relative ${activeChatId === item._id
                                    ? (theme === 'light' ? 'bg-zinc-200 text-zinc-900' : 'bg-[#212121] text-white')
                                    : (theme === 'light' ? 'text-zinc-600 hover:bg-zinc-100' : 'text-zinc-400 hover:bg-[#212121] hover:text-zinc-200')
                                    }`}
                            >
                                <span className="truncate flex-1">{item.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* User Profile - Bottom Sidebar */}
                <div className={`mt-auto pt-3 border-t ${theme === 'light' ? 'border-zinc-200' : 'border-white/10'}`}>

                    {/* Logout Menu (Visible when profile is open) */}
                    {isProfileOpen && (
                        <div className="mb-2 p-1 rounded-lg bg-red-500/10 border border-red-500/20">
                            <button
                                onClick={onLogout}
                                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors font-medium flex items-center justify-between"
                            >
                                Sign Out
                                <X size={14} className="opacity-50" />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center gap-3 w-full px-2 py-2 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-zinc-100' : 'hover:bg-[#212121]'}`}
                    >
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName.replace(' ', '')}`}
                            alt="User"
                            className="w-8 h-8 rounded-full bg-zinc-200"
                        />
                        <div className="flex-1 text-left">
                            <div className="text-sm font-medium truncate">{userName}</div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md inline-block mt-1 ${userRole === 'admin'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                {userRole === 'admin' ? 'Enterprise' : 'Personal 🎓'}
                            </div>
                        </div>
                    </button>

                    {/* UPGRADE PROMPT FOR PERSONAL USERS */}
                    {userRole !== 'admin' && (
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/5 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h4 className="text-xs font-bold text-white mb-1">Scale Up</h4>
                                <p className="text-[10px] text-zinc-400 leading-tight mb-3">Upgrade to Enterprise for team collaboration.</p>
                                <button
                                    onClick={onUpgradeClick}
                                    className="w-full py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                                >
                                    Go Corporate
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:rotate-12 transition-transform">
                                <Sparkles size={24} className="text-white" />
                            </div>
                        </div>
                    )}

                    {/* UPGRADE PROMPT FOR ENTERPRISE ADMINS */}
                    {userRole === 'admin' && (
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-orange-600/20 border border-white/5 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h4 className="text-xs font-bold text-white mb-1">Enterprise Pro</h4>
                                <p className="text-[10px] text-zinc-400 leading-tight mb-3">Unlock unlimited tokens & advanced RAG.</p>
                                <button
                                    onClick={onManagePlan}
                                    className="w-full py-2 bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white hover:text-black transition-all border border-white/10 active:scale-95"
                                >
                                    Manage Plan
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:rotate-12 transition-transform">
                                <Briefcase size={24} className="text-white" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

// ==================== EMPTY STATE COMPONENT ====================
export const EmptyState = ({ t, theme, setInput }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="mb-8 p-4 bg-white/5 rounded-full ring-1 ring-white/10 shadow-2xl animate-breathe">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <div className="w-8 h-8 rounded-full bg-black" />
                </div>
            </div>
            <h2 className="text-2xl font-semibold mb-8">{t.greeting}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                {[
                    { icon: <FileCheck className="text-orange-400" />, text: t.suggestion1 },
                    { icon: <User className="text-blue-400" />, text: t.suggestion2 },
                    { icon: <AlertCircle className="text-red-400" />, text: t.suggestion3 },
                    { icon: <Settings className="text-purple-400" />, text: t.suggestion4 }
                ].map((card, i) => (
                    <button
                        key={i}
                        onClick={() => setInput(card.text)}
                        className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:-translate-y-0.5 ${theme === 'light' ? 'bg-white border-zinc-200 hover:bg-zinc-50' : 'bg-[#171717] border-white/5 hover:bg-[#2f2f2f]'
                            }`}
                    >
                        {card.icon}
                        <span className="text-sm font-medium opacity-80">{card.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// ==================== MESSAGE LIST COMPONENT ====================
export const MessageList = ({ messages, loading, userName, messagesEndRef, theme, t }) => {
    return (
        <div className="w-full max-w-3xl mx-auto pt-20 pb-40 px-4 md:px-0">
            {messages.map((msg, i) => (
                <div key={i} className={`group w-full text-base border-b border-black/5 dark:border-white/5 last:border-0`}>
                    <div className={`flex gap-4 md:gap-6 py-6 md:py-8 m-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className="flex-shrink-0 flex flex-col relative items-end">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                                {msg.role === 'user' ? (
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName.replace(' ', '')}`} alt="User" className="w-full h-full object-cover bg-zinc-200" />
                                ) : (
                                    <div className="w-full h-full bg-black flex items-center justify-center">
                                        <div className="w-4 h-4 rounded-full bg-white animate-pulse-slow" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`relative flex-1 overflow-hidden ${msg.role === 'user' ? 'text-right' : ''}`}>
                            <div className="font-semibold text-sm mb-1 opacity-90">{msg.role === 'user' ? t.you : 'OpsMind'}</div>
                            <div className={`prose ${theme === 'light' ? 'prose-zinc' : 'prose-invert'} max-w-none leading-7 inline-block text-left`}>
                                <p className={`whitespace-pre-wrap ${msg.role === 'user' ? (theme === 'light' ? 'bg-zinc-100 text-zinc-800' : 'bg-[#2f2f2f] text-zinc-100') + ' p-3 rounded-2xl rounded-tr-none' : ''}`}>
                                    {msg.text}
                                </p>
                            </div>

                            {/* SOURCES */}
                            {msg.sources?.length > 0 && (
                                <div className={`mt-4 flex flex-wrap gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.sources.map((s, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium cursor-help" title={`Page ${s.page}`}>
                                            <FileCheck size={12} />
                                            {s.file} (p. {s.page})
                                        </div>
                                    ))}
                                </div>
                            )}

                            {msg.error && <p className="text-red-400 text-sm mt-2">{t.errorConnecting}</p>}
                        </div>
                    </div>
                </div>
            ))}

            {loading && (
                <div className="w-full py-6 md:py-8">
                    <div className="flex gap-4 md:gap-6 m-auto">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-white animate-spin" />
                        </div>
                        <div className="flex items-center">
                            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce mr-1"></span>
                            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-100 mr-1"></span>
                            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

// ==================== CHAT INPUT COMPONENT ====================
export const ChatInput = ({
    input,
    setInput,
    handleSendMessage,
    handlePlusClick,
    uploading,
    theme,
    t
}) => {
    return (
        <div className={`absolute bottom-0 left-0 w-full p-4 pt-0 bg-gradient-to-t ${theme === 'light' ? 'from-white via-white' : 'from-[#212121] via-[#212121]'} to-transparent pb-6 z-20`}>
            <div className="max-w-3xl mx-auto">
                <form
                    onSubmit={handleSendMessage}
                    className={`relative flex items-end p-3 rounded-2xl shadow-xl border transition-all ring-0 focus:ring-0 ${theme === 'light'
                        ? 'bg-white border-zinc-200 focus-within:border-zinc-400'
                        : 'bg-[#2f2f2f] border-zinc-700/50 focus-within:border-zinc-600'
                        }`}
                >
                    <button
                        type="button"
                        onClick={handlePlusClick}
                        className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-black/20 mr-2 flex-shrink-0"
                        title="Upload PDF"
                    >
                        {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                    </button>

                    <input
                        className={`w-full bg-transparent border-0 focus:ring-0 outline-none resize-none py-2 max-h-[200px] overflow-y-auto text-base ${theme === 'light' ? 'text-zinc-800 placeholder-zinc-400' : 'text-zinc-100 placeholder-zinc-500'}`}
                        placeholder={t.placeholder}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={uploading}
                        autoFocus
                    />

                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className={`p-2 rounded-lg transition-all flex-shrink-0 ${input.trim()
                            ? 'bg-white text-black'
                            : 'bg-transparent text-zinc-600 cursor-not-allowed'
                            }`}
                    >
                        <SendHorizontal size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};
