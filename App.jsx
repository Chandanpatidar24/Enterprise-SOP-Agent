
import { SendHorizonal } from 'lucide-react';
import React from 'react';

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-[#0e0e0e] text-white font-sans">
      {/* 1. Top Navbar */}
      <nav className="flex items-center justify-between p-5 px-8">
        <div className="flex items-center gap-4">
          <div className="cursor-pointer p-2 hover:bg-zinc-800 rounded-full transition text-xl">☰</div>
          <span className="text-xl font-medium tracking-tight">Ops Mind AI</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-light text-zinc-300">
          <span className="hidden md:inline cursor-pointer hover:text-white">About Ops Mind AI</span>
          <span className="hidden md:inline cursor-pointer hover:text-white">Ops Mind AI</span>
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full text-white font-medium transition shadow-lg">
            Sign in
          </button>
        </div>
      </nav>

      {/* 2. Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-6xl font-serif bg-gradient-to-r from-green-400 via-blue-400 to-red-400 bg-clip-text text-transparent">
          Meet Ops Mind AI,
        </h1>
        <p className="text-4xl md:text-5xl  font-serif text-zinc-500 mt-3">
          Corporate Knowledge Assistant
        </p>
      </main>

      {/* 3. Bottom Chat Input */}
      <footer className="w-full max-w-3xl mx-auto p-6 mb-2">
        <div className="flex items-center bg-[#1e1e20] border border-zinc-800 rounded-2xl p-2 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all shadow-2xl">
          <button className="p-3 text-zinc-400 hover:text-white text-xl font-light">+</button>
          <input 
            type="text"
            className="flex-1 bg-transparent border-none outline-none px-2 text-lg placeholder-zinc-500"
            placeholder="Ask Ops Mind AI" 
          />
          {/* Right side of input bar */}
<div className="flex items-center pr-2">
  <button 
    className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-200 flex items-center justify-center shadow-md active:scale-95"
    aria-label="Send message"
  >
    <SendHorizonal size={20} strokeWidth={2.5} />
  </button>
</div>
        </div>
        <p className="text-[10px] text-zinc-600 text-center mt-4">
          Google Terms and the Google Privacy Policy apply. Ops Mind AI can make mistakes, so double-check it.
        </p>
      </footer>
    </div>
  );
}