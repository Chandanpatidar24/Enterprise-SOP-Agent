import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Zap, Brain, FileText, Users, ChevronDown, Check, ArrowUpRight, MessageSquare, Crown, Building2, Rocket } from 'lucide-react';

const LandingPage = ({ onLogin, onSignup }) => {
    const [scrolled, setScrolled] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-rotate features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Spotlight effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const features = [
        {
            icon: <Brain className="w-6 h-6" />,
            title: "AI-Powered Intelligence",
            description: "Leverage GPT-4 Turbo, Claude 3, and Gemini to understand and analyze your enterprise SOPs with unprecedented accuracy.",
            gradient: "from-violet-500 to-purple-500"
        },
        {
            icon: <FileText className="w-6 h-6" />,
            title: "Smart Document Processing",
            description: "Upload PDFs instantly. Our RAG pipeline converts complex documents into searchable, intelligent knowledge bases.",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Enterprise Security",
            description: "Role-based access control, encrypted data storage, and audit trails keep your sensitive information protected.",
            gradient: "from-emerald-500 to-green-500"
        }
    ];



    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Global Spotlight */}
                <div
                    className="absolute inset-0 z-0 transition-opacity duration-300 opacity-40"
                    style={{
                        background: `radial-gradient(1000px at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.08), transparent 80%)`
                    }}
                />
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-500/5 to-cyan-500/5 rounded-full blur-[150px]" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5' : ''}`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-zinc-400 flex items-center justify-center shadow-lg shadow-white/10">
                                <div className="w-5 h-5 rounded-full bg-black" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">OpsMind</span>
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-gradient-to-r from-violet-500 to-purple-500 rounded-full uppercase tracking-wider">AI</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
                            <a href="#enterprise" className="text-sm text-zinc-400 hover:text-white transition-colors">Enterprise</a>
                            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={onLogin}
                                className="hidden md:block text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                Sign in
                            </button>
                            <button
                                onClick={onSignup}
                                className="group flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-200 transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/20"
                            >
                                Get Started
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32">
                <div className="max-w-7xl mx-auto px-6 text-center">


                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
                        <span className="bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
                            Your Enterprise
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                            Knowledge, Amplified
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Transform your SOPs into an intelligent, conversational knowledge base.
                        Get instant, accurate answers powered by the world's most advanced AI models.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <button
                            onClick={onSignup}
                            className="group relative flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl text-base font-semibold hover:bg-zinc-100 transition-all hover:scale-105 shadow-2xl shadow-white/20"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Start Chatting Now
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Hero Visual */}
                    <div className="relative max-w-5xl mx-auto">
                        {/* Glow Effect */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-60" />

                        {/* Main Card */}
                        <div className="relative bg-[#111]/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
                            {/* Browser Chrome */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                <div className="flex-1 mx-4 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <span className="text-xs text-zinc-500">opsmind.ai/chat</span>
                                </div>
                            </div>

                            {/* Chat Preview */}
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                                        U
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-sm p-4">
                                        <p className="text-zinc-300">What's the procedure for handling data breaches according to our IT security policy?</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                                        <div className="w-5 h-5 rounded-full bg-black" />
                                    </div>
                                    <div className="flex-1 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl rounded-tl-sm p-4 border border-violet-500/20">
                                        <p className="text-zinc-200 mb-3">Based on the IT Security Policy (v2.3), here's the data breach protocol:</p>
                                        <ol className="text-zinc-400 text-sm space-y-2 list-decimal list-inside">
                                            <li>Immediately isolate affected systems</li>
                                            <li>Notify the Security Response Team within 1 hour</li>
                                            <li>Document all details in the Incident Report Form...</li>
                                        </ol>
                                        <div className="mt-4 flex items-center gap-2">
                                            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30">📄 IT-Security-Policy.pdf (p.12)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Typing Indicator */}
                            <div className="mt-6 flex items-center gap-3 text-zinc-500 text-sm">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span>OpsMind is typing...</span>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute -top-6 -right-6 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl backdrop-blur-sm animate-float">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium">99.2% Accuracy</span>
                            </div>
                        </div>

                        <div className="absolute -bottom-4 -left-6 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl backdrop-blur-sm animate-float" style={{ animationDelay: '1s' }}>
                            <div className="flex items-center gap-2 text-blue-400">
                                <Zap className="w-4 h-4" />
                                <span className="text-sm font-medium">Response in 0.8s</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500 animate-bounce">
                    <span className="text-xs">Scroll to explore</span>
                    <ChevronDown className="w-5 h-5" />
                </div>
            </section>



            {/* Features Section */}
            <section id="features" className="relative py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <span className="inline-block px-4 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20 mb-6">
                            FEATURES
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Built for Enterprise <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Intelligence</span>
                        </h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                            Everything you need to transform static documents into dynamic, AI-powered knowledge systems.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className={`group relative p-8 rounded-2xl border transition-all duration-500 cursor-pointer ${activeFeature === i
                                    ? 'bg-white/5 border-white/20 scale-105'
                                    : 'bg-[#111] border-white/5 hover:border-white/10'
                                    }`}
                                onMouseEnter={() => setActiveFeature(i)}
                            >
                                {/* Glow on active */}
                                {activeFeature === i && (
                                    <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-20 blur-xl`} />
                                )}

                                <div className="relative">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enterprise Section */}
            <section id="enterprise" className="relative py-32 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="inline-block px-4 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 mb-6">
                                ENTERPRISE READY
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Security That
                                <br />
                                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Scales With You</span>
                            </h2>
                            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                                Designed from the ground up for enterprise deployments. Your data stays protected
                                with industry-leading security measures and compliance certifications.
                            </p>

                            <div className="space-y-4">
                                {[
                                    "SOC 2 Type II Certified",
                                    "GDPR & HIPAA Compliant",
                                    "SSO & SAML Integration",
                                    "Role-Based Access Control",
                                    "End-to-End Encryption"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        </div>
                                        <span className="text-zinc-300">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="mt-10 group flex items-center gap-2 text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                                Learn about our security
                                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
                            <div className="relative bg-[#111] rounded-2xl border border-white/10 p-8">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: <Shield className="w-6 h-6" />, label: "Encrypted Storage", value: "AES-256" },
                                        { icon: <Users className="w-6 h-6" />, label: "Team Members", value: "Unlimited" },
                                        { icon: <FileText className="w-6 h-6" />, label: "Documents", value: "No Limit" },
                                        { icon: <Zap className="w-6 h-6" />, label: "API Calls", value: "10M/month" }
                                    ].map((item, i) => (
                                        <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="text-emerald-400 mb-3">{item.icon}</div>
                                            <div className="text-xs text-zinc-500 mb-1">{item.label}</div>
                                            <div className="text-lg font-semibold">{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="relative py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 text-xs font-medium bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 mb-6">
                            PRICING
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Simple, <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Transparent Pricing</span>
                        </h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                            Choose the plan that fits your organization. All plans include core AI features.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Basic Plan */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative p-8 rounded-2xl bg-[#111] border border-white/5 hover:border-blue-500/20 transition-all h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                                        <Rocket className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold">Basic</h3>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">$0</span>
                                        <span className="text-zinc-500">/month</span>
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-2">Perfect for personal knowledge mapping</p>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-blue-400" />
                                        </div>
                                        <span className="text-zinc-300">10 Documents included</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-blue-400" />
                                        </div>
                                        <span className="text-zinc-300">Gemini 1.5 Flash</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-blue-400" />
                                        </div>
                                        <span className="text-zinc-300">Basic RAG Intelligence</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-blue-400" />
                                        </div>
                                        <span className="text-zinc-300">Web Dashboard Access</span>
                                    </div>
                                </div>

                                <button
                                    onClick={onSignup}
                                    className="w-full py-3.5 px-6 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>

                        {/* Pro Plan */}
                        <div className="relative group">
                            <div className="absolute -inset-px bg-gradient-to-b from-blue-500 to-purple-500 rounded-2xl opacity-100" />
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
                            <div className="relative p-8 rounded-2xl bg-[#0d0d0d] border border-transparent h-full flex flex-col">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                        Most Popular
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 mb-4 mt-2">
                                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold">Pro</h3>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">$49</span>
                                        <span className="text-zinc-500">/month</span>
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-2">Best for power users & researchers</p>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-blue-400" />
                                        </div>
                                        <span className="text-zinc-300"><strong className="text-white">Unlimited</strong> Documents</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-blue-400" />
                                        </div>
                                        <span className="text-zinc-300">Gemini 1.5 Pro</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-blue-400" />
                                        </div>
                                        <span className="text-zinc-300">Deep context analysis</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-blue-400" />
                                        </div>
                                        <span className="text-zinc-300">Advanced Formatting</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-blue-400" />
                                        </div>
                                        <span className="text-zinc-300">Priority Processing</span>
                                    </div>
                                </div>

                                <button
                                    onClick={onSignup}
                                    className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all shadow-lg"
                                >
                                    Scale Up Now
                                </button>
                            </div>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative p-8 rounded-2xl bg-[#111] border border-orange-500/20 hover:border-orange-500/40 transition-all h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
                                        <Crown className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold">Enterprise</h3>
                                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-orange-500/30">
                                        Scale
                                    </span>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">$199</span>
                                        <span className="text-zinc-500">/month</span>
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-2">Custom intelligence for large organizations</p>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-orange-400" />
                                        </div>
                                        <span className="text-zinc-300">Team Collaboration</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-orange-400" />
                                        </div>
                                        <span className="text-zinc-300">Role-Based Access Control</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-orange-400" />
                                        </div>
                                        <span className="text-zinc-300">Full API Access</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-orange-400" />
                                        </div>
                                        <span className="text-zinc-300">Priority Support</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-orange-400" />
                                        </div>
                                        <span className="text-zinc-300">Custom Training Models</span>
                                    </div>
                                </div>

                                <button
                                    onClick={onSignup}
                                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold hover:from-orange-400 hover:to-amber-400 transition-all shadow-lg"
                                >
                                    Go Corporate
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* FAQ or Additional Info */}
                    <div className="mt-16 text-center">
                        <p className="text-zinc-500 text-sm">
                            All plans include a 14-day free trial. No credit card required.
                        </p>
                        <p className="text-zinc-600 text-xs mt-2">
                            Need a custom plan? <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">Contact our sales team</a>
                        </p>
                    </div>
                </div>
            </section>


            <section className="relative py-32">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/30 via-purple-500/30 to-cyan-500/30 rounded-3xl blur-2xl" />
                        <div className="relative bg-[#111] rounded-3xl border border-white/10 p-12 md:p-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Ready to Transform Your
                                <br />
                                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Knowledge Management?</span>
                            </h2>
                            <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
                                Join hundreds of enterprises already using OpsMind to empower their teams with instant access to critical information.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={onSignup}
                                    className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl text-base font-semibold hover:bg-zinc-100 transition-all hover:scale-105 shadow-2xl shadow-white/20"
                                >
                                    Start Free Trial
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="flex items-center gap-3 px-8 py-4 text-zinc-400 hover:text-white transition-colors">
                                    Contact Sales
                                    <ArrowUpRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative border-t border-white/5 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-5 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-zinc-400 flex items-center justify-center">
                                    <div className="w-5 h-5 rounded-full bg-black" />
                                </div>
                                <span className="text-xl font-bold">OpsMind</span>
                            </div>
                            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                                Transforming enterprise knowledge management with cutting-edge AI technology.
                            </p>
                        </div>

                        {[
                            { title: 'Product', links: ['Features', 'Pricing', 'Security', 'Enterprise'] },
                            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                            { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'Licenses'] }
                        ].map((col, i) => (
                            <div key={i}>
                                <h4 className="font-medium mb-4">{col.title}</h4>
                                <ul className="space-y-3">
                                    {col.links.map((link, j) => (
                                        <li key={j}>
                                            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">{link}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
                        <p className="text-sm text-zinc-500">© 2026 OpsMind AI. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                            </a>
                            <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            </a>
                            <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
