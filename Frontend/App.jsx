
import { SendHorizonal, Plus, Loader2, FileCheck, Trash2, Database, MessageSquare, AlertCircle } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [view, setView] = useState('chat'); // 'chat' or 'admin'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Fetch documents for Admin view
  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/documents`);
      const data = await res.json();
      if (data.success) setDocuments(data.documents);
    } catch (err) {
      console.error('Error fetching docs:', err);
    }
  };

  useEffect(() => {
    if (view === 'admin') fetchDocuments();
  }, [view]);

  const handlePlusClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setUploadStatus('success');
        setTimeout(() => setUploadStatus(null), 3000);
        if (view === 'admin') fetchDocuments();
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      });
      const data = await res.json();

      const aiMsg = {
        role: 'ai',
        text: data.answer,
        sources: data.sources || []
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I can't connect to the server right now.", error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const deleteDoc = async (filename) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/documents/${filename}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchDocuments();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0e0e0e] text-white font-sans overflow-hidden">
      {/* 1. Navbar */}
      <nav className="flex items-center justify-between p-4 px-8 border-b border-zinc-900 bg-[#0e0e0e] z-10">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">OpsMind AI</div>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setView('chat')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition ${view === 'chat' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <MessageSquare size={16} /> Chat
          </button>
          <button
            onClick={() => setView('admin')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition ${view === 'admin' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Database size={16} /> Knowledge
          </button>
        </div>
        <div className="w-24 flex justify-end">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 border border-zinc-700"></div>
        </div>
      </nav>

      {/* 2. Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {view === 'chat' ? (
          <>
            {/* Chat List */}
            <div className="flex-1 overflow-y-auto scrollbar-left p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
                  <h1 className="text-5xl font-serif mb-4 bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">Welcome to OpsMind</h1>
                  <p className="text-zinc-500 text-lg max-w-md">I'm your corporate knowledge assistant. Upload SOPs to get started.</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={msg.role === 'user' ? 'message-user' : 'message-ai'}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    {msg.sources?.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                        {msg.sources.map((s, idx) => (
                          <span key={idx} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-zinc-400">
                            {s.file} (Page {s.page})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message-ai">
                  <div className="flex items-center gap-1">
                    <span className="thinking-dot"></span>
                    <span className="thinking-dot"></span>
                    <span className="thinking-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <footer className="p-6 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e] to-transparent">
              <div className="max-w-3xl mx-auto transition-all">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center bg-[#1e1e20] border border-zinc-800 rounded-2xl p-2 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-800 transition shadow-2xl"
                >
                  <button
                    type="button"
                    onClick={handlePlusClick}
                    disabled={uploading}
                    className="p-3 text-zinc-400 hover:text-white transition rounded-xl hover:bg-zinc-800/50"
                  >
                    {uploading ? <Loader2 className="animate-spin" size={20} /> : uploadStatus === 'success' ? <FileCheck className="text-green-500" size={20} /> : <Plus size={20} />}
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none px-3 text-base placeholder-zinc-500"
                    placeholder={uploading ? "Analyzing document..." : "Ask your enterprise knowledge assistant..."}
                    disabled={uploading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading || uploading}
                    className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition shadow-md disabled:opacity-30 disabled:grayscale"
                  >
                    <SendHorizonal size={18} />
                  </button>
                </form>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
              </div>
            </footer>
          </>
        ) : (
          /* Admin View */
          <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Knowledge Base</h2>
                <p className="text-zinc-500 text-sm">Manage all SOP documents indexed in the system.</p>
              </div>
              <button
                onClick={handlePlusClick}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition"
              >
                <Plus size={18} /> Add Document
              </button>
            </div>

            <div className="bg-[#141416] border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full admin-table">
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Chunks</th>
                    <th>Last Updated</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-20 text-zinc-600">
                        <Database className="mx-auto mb-4 opacity-20" size={48} />
                        No documents indexed yet.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc, idx) => (
                      <tr key={idx}>
                        <td className="font-medium">{doc.filename}</td>
                        <td className="text-zinc-500">{doc.chunkCount} segments</td>
                        <td className="text-zinc-500">{new Date(doc.lastUpdated).toLocaleDateString()}</td>
                        <td className="text-right">
                          <button
                            onClick={() => deleteDoc(doc.filename)}
                            className="p-2 text-zinc-600 hover:text-red-500 transition hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-xl flex items-start gap-4">
              <AlertCircle className="text-blue-500 mt-1" size={20} />
              <div className="text-sm text-zinc-400">
                <span className="font-bold text-zinc-100">Pro Tip:</span> Deleting a document will remove all its vector segments instantly. The AI will no longer be able to answer questions using that data until it is re-uploaded.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
