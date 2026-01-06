import React, { useState } from 'react';
import { X, Briefcase, Zap, Shield, Check, Loader2 } from 'lucide-react';

const CorporateUpgradeModal = ({ isOpen, onClose, onUpgradeSuccess, token, theme }) => {
    const [companyName, setCompanyName] = useState('');
    const [plan, setPlan] = useState('free');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleUpgrade = async (e) => {
        e.preventDefault();
        if (!companyName.trim()) {
            setError('Please enter your company name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/upgrade-organization`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ companyName, plan })
            });

            const data = await res.json();

            if (data.success) {
                onUpgradeSuccess(data.data);
                onClose();
            } else {
                setError(data.message || 'Upgrade failed. Please try again.');
            }
        } catch (err) {
            setError('Server error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-lg p-8 rounded-2xl border shadow-2xl scale-100 ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#121212] border-white/10'}`}>
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                            <Briefcase size={24} />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight">Go Corporate</h3>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <p className="text-zinc-500 mb-8 leading-relaxed">
                    Transform your personal workspace into a professional organization. You'll become an <strong>Admin</strong> and can invite your team.
                </p>

                <form onSubmit={handleUpgrade} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">Company Name</label>
                        <input
                            autoFocus
                            placeholder="e.g. Acme Corp"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className={`w-full px-4 py-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:font-medium ${theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400' : 'bg-[#1a1a1a] border-white/5 text-white placeholder:text-zinc-700'}`}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">Select Your Plan</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: 'free', name: 'Starter', price: '$0', icon: <Zap size={14} /> },
                                { id: 'pro', name: 'Professional', price: '$29', icon: <Shield size={14} /> }
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setPlan(p.id)}
                                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${plan === p.id
                                        ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500'
                                        : theme === 'light' ? 'border-zinc-200 bg-white hover:border-zinc-300' : 'border-white/5 bg-[#1a1a1a] hover:border-white/20'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-1.5 rounded-lg ${plan === p.id ? 'bg-blue-500 text-white' : 'bg-white/5 text-zinc-500'}`}>
                                            {p.icon}
                                        </div>
                                        {plan === p.id && <Check size={14} className="text-blue-500" />}
                                    </div>
                                    <div className={`font-bold text-sm ${plan === p.id ? (theme === 'light' ? 'text-zinc-900' : 'text-white') : 'text-zinc-500'}`}>{p.name}</div>
                                    <div className="text-xs text-zinc-500">{p.price}/mo</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
                            <X size={14} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Upgrade Now'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CorporateUpgradeModal;
