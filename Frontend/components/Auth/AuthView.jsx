import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles, Building2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthView({ onAuthSuccess, initialMode = 'login' }) {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [showPassword, setShowPassword] = useState(false);
    const containerRefInternal = useRef(null);

    const [step, setStep] = useState(1); // 1: Info, 2: Choice, 3: Enterprise Details
    const [signupType, setSignupType] = useState('personal'); // 'personal' or 'enterprise'

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        companyName: '',
        plan: 'free'
    });

    // ... handleMouseMove logic remains same ...
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (containerRefInternal.current) {
                const rect = containerRefInternal.current.getBoundingClientRect();
                setMousePos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (step === 1) {
            if (!formData.username || !formData.email || !formData.password) {
                setError('Please fill all fields');
                return;
            }
            setStep(2);
        }
    };

    const handleChoice = (type) => {
        setSignupType(type);
        if (type === 'personal') {
            submitAuth('personal');
        } else {
            setStep(3);
        }
    };

    const submitAuth = async (type, plan = 'free') => {
        setLoading(true);
        setError('');

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin
            ? { email: formData.email, password: formData.password }
            : {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                signupType: type,
                companyName: type === 'enterprise' ? formData.companyName : null,
                plan: plan
            };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                login(data.data, data.token);
                onAuthSuccess(data.data);
            } else {
                setError(data.message || 'Authentication failed');
                if (step > 1) setStep(1); // Reset if failed
            }
        } catch (err) {
            console.error('Auth Connection Error:', err);
            setError('Connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            submitAuth();
        } else {
            handleNextStep(e);
        }
    };

    return (
        <div
            ref={containerRefInternal}
            className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-500/30"
        >
            {/* Interactive Spotlight Background */}
            <div
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
                }}
            />

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                    {/* Animated Border Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex flex-col items-center mb-10 relative">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Sparkles className="text-blue-600" size={32} />
                        </div>
                        <h1 className="text-4xl font-black bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent tracking-tight">
                            {isLogin ? 'OpsMind AI' : step === 1 ? 'Start Journey' : step === 2 ? 'Choose Path' : 'Scale Up'}
                        </h1>
                        <p className="text-zinc-500 mt-2 text-center text-sm font-medium">
                            {isLogin
                                ? 'The neural workspace for modern enterprise.'
                                : step === 1 ? 'Begin your journey into AI-driven operations.' : step === 2 ? 'How will you use OpsMind?' : 'Select your workspace plan.'}
                        </p>
                    </div>

                    {step === 1 || isLogin ? (
                        <form onSubmit={handleSubmit} className="space-y-4 relative">
                            {!isLogin && (
                                <div className="space-y-1.5 group/input">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <User size={12} className="text-blue-500" /> Username
                                    </label>
                                    <input
                                        required
                                        name="username"
                                        type="text"
                                        placeholder="Choose a username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-600 text-sm font-medium"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5 group/input">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Mail size={12} className="text-blue-500" /> {isLogin ? 'Credentials' : 'Email Address'}
                                </label>
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    placeholder="name@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-600 text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-1.5 group/input">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Lock size={12} className="text-blue-500" /> Secure Password
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-600 text-sm font-medium pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in shake duration-300">
                                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-6 shadow-xl shadow-blue-500/20 group/btn overflow-hidden relative"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span className="relative z-10">{isLogin ? 'Authenticate' : 'Continue'}</span>
                                        <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : step === 2 ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <button
                                onClick={() => handleChoice('personal')}
                                className="w-full bg-white/5 border border-white/5 hover:border-blue-500/50 p-6 rounded-3xl text-left transition-all group/opt relative overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-1">Personal Use</h3>
                                        <p className="text-zinc-500 text-sm">Study, organize notes & chat with your docs.</p>
                                    </div>
                                    <Sparkles className="text-blue-500" size={24} />
                                </div>
                            </button>

                            <button
                                onClick={() => handleChoice('enterprise')}
                                className="w-full bg-white/5 border border-white/5 hover:border-purple-500/50 p-6 rounded-3xl text-left transition-all group/opt relative overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-1">Professional Use</h3>
                                        <p className="text-zinc-500 text-sm">Company SOPs, team workspace & enterprise features.</p>
                                    </div>
                                    <Building2 className="text-purple-500" size={24} />
                                </div>
                            </button>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full text-zinc-600 text-xs font-bold uppercase tracking-widest mt-4 hover:text-white transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-1.5 group/input">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Building2 size={12} className="text-blue-500" /> Company Name
                                </label>
                                <input
                                    required
                                    name="companyName"
                                    type="text"
                                    placeholder="Enter your company name"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-600 text-sm font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => submitAuth('enterprise', 'free')}
                                    className="bg-white/5 border-2 border-transparent hover:border-blue-500/30 p-4 rounded-2xl text-center transition-all group"
                                >
                                    <span className="block text-white font-bold text-sm">Free Trial</span>
                                    <span className="block text-zinc-500 text-[10px] mt-1">7 Days • 100 Qs</span>
                                </button>
                                <button
                                    onClick={() => submitAuth('enterprise', 'pro')}
                                    className="bg-blue-600/10 border-2 border-blue-500/30 p-4 rounded-2xl text-center transition-all shadow-lg shadow-blue-500/10"
                                >
                                    <span className="block text-blue-400 font-bold text-sm">Pro Plan</span>
                                    <span className="block text-blue-400/60 text-[10px] mt-1">$49/mo • Unlimited</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full text-zinc-600 text-xs font-bold uppercase tracking-widest mt-2 hover:text-white transition-colors text-center"
                            >
                                Back to Choice
                            </button>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 text-center relative">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setStep(1);
                            }}
                            className="text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                        >
                            {isLogin ? "New to the system? Sign Up" : 'Already authorized? Login'}
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-10 px-4">
                    <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.3em]">
                        Neural Intelligence System v2.0
                    </p>
                    <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20 animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/20 animate-pulse delay-75" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 animate-pulse delay-150" />
                    </div>
                </div>
            </div>

            {/* Global Styles for Shimmer and Shake */}
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .group-hover\\:animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-in.shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}</style>
        </div>
    );
}
