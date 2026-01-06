import React, { useState } from 'react';
import { X, Check, Shield, Zap, Sparkles, Building2, ChevronRight, Loader2 } from 'lucide-react';

const PlanManagementModal = ({ isOpen, onClose, theme }) => {
    const [devPopup, setDevPopup] = useState(false);

    if (!isOpen) return null;

    const plans = [
        {
            id: 'basic',
            name: 'Basic',
            price: '$0',
            description: 'Standard access for personal use.',
            features: ['10 Documents', 'Gemini 1.5 Flash', 'Basic RAG'],
            isCurrent: true,
            color: 'blue'
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '$49',
            description: 'Advanced features for individuals.',
            features: ['Unlimited Documents', 'Gemini 1.5 Pro', 'Deep Analysis', 'Advanced Formatting'],
            isCurrent: false,
            color: 'purple'
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: '$199',
            description: 'Full power for large teams.',
            features: ['Team Collaboration', 'Role-Based Access', 'API Access', 'Priority Support'],
            isCurrent: false,
            color: 'orange'
        }
    ];

    const handlePlanClick = (plan) => {
        if (plan.isCurrent) {
            onClose();
            return;
        }
        setDevPopup(true);
    };

    return (
        <>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                <div className={`w-full max-w-4xl p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#0a0a0b] border-white/10'}`}>
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] -ml-32 -mb-32 rounded-full" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-3xl font-black tracking-tight text-white mb-2">Subscription Center</h3>
                                <p className="text-zinc-500 font-medium">Manage your workspace performance and scale.</p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-zinc-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`relative p-6 rounded-3xl border transition-all duration-500 flex flex-col group ${plan.isCurrent
                                            ? (theme === 'light' ? 'bg-zinc-100 border-zinc-300' : 'bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20')
                                            : (theme === 'light' ? 'bg-white border-zinc-200 hover:border-zinc-400' : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]')
                                        }`}
                                >
                                    {plan.isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                                            Active Plan
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${plan.color === 'blue' ? 'text-blue-400' :
                                                plan.color === 'purple' ? 'text-purple-400' : 'text-orange-400'
                                            }`}>
                                            {plan.name}
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-white">{plan.price}</span>
                                            <span className="text-zinc-500 text-sm font-bold">/mo</span>
                                        </div>
                                    </div>

                                    <p className="text-zinc-500 text-xs mb-6 font-medium leading-relaxed uppercase tracking-wider">
                                        {plan.description}
                                    </p>

                                    <div className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                                                <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center">
                                                    <Check size={10} className="text-blue-500" />
                                                </div>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handlePlanClick(plan)}
                                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 ${plan.isCurrent
                                                ? 'bg-transparent border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white'
                                                : 'bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-xl shadow-black/20'
                                            }`}
                                    >
                                        {plan.isCurrent ? 'Continue Free' : 'Select Plan'}
                                        {!plan.isCurrent && <ChevronRight size={14} />}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <div className="text-white font-black text-sm uppercase tracking-wider">Enterprise Intelligence</div>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Need custom seats or dedicated infrastructure?</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDevPopup(true)}
                                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all border border-white/5 shadow-xl"
                            >
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Under Development Popup */}
            {devPopup && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`w-full max-w-sm p-8 rounded-3xl border shadow-2xl scale-100 ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#121212] border-white/10'}`}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                                <Loader2 size={32} className="animate-spin" />
                            </div>
                            <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Under Development</h4>
                            <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
                                Our payment gateway is currently in audit mode. Commercial plans will be available in the next release.
                            </p>
                            <button
                                onClick={() => setDevPopup(false)}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all shadow-xl active:scale-95"
                            >
                                Noted
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PlanManagementModal;
