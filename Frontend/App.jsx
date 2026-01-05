import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { X } from 'lucide-react';
import { Sidebar, EmptyState, MessageList, ChatInput } from './components/ChatView/ChatComponents';
import ChatHeader from './components/ChatView/ChatHeader';
import KnowledgeBaseView from './components/ChatView/KnowledgeBaseView';
import AdminPanel from './components/AdminPanel/AdminPanel';
import SettingsView from './components/Settings/Settings';
import LandingPage from './components/LandingPage/LandingPage';
import translations from './components/Settings/translations';
import Login from './components/Auth/Login';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, token, isAuthenticated, logout, loading: authLoading } = useAuth();

  const [view, setView] = useState(() => {
    const path = window.location.pathname;
    if (path === '/kb') return 'admin';
    if (path === '/settings') return 'settings';
    if (path === '/admin') return 'adminPanel';
    if (path === '/chat') return 'chat';
    if (path === '/login') return 'login';
    return 'landing';
  });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [theme, setTheme] = useState('dark');

  // Settings States
  const [accentColor, setAccentColor] = useState('blue');
  const [language, setLanguage] = useState('en');
  const t = translations[language];

  // Selected Model State
  const [selectedModel, setSelectedModel] = useState('opsmind4');

  const [modelsList, setModelsList] = useState([
    { id: 1, name: 'OpsMind 4.0 (Gemini Pro)', access: ['admin', 'manager', 'user'] },
    { id: 2, name: 'OpsMind 4.2 (GPT-4)', access: ['admin', 'manager'] },
    { id: 3, name: 'OpsMind 5.0 (Claude 3 Opus)', access: ['admin'] }
  ]);

  // Sidebar & Profile States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const messagesEndRef = useRef(null);

  const accentMap = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-emerald-500',
    orange: 'bg-orange-500',
  };

  // Handle browser back/forward buttons & Auth Redirect
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setView('adminPanel');
      } else if (path === '/kb') {
        setView('admin');
      } else if (path === '/settings') {
        setView('settings');
      } else if (path === '/chat') {
        setView('chat');
      } else if (path === '/login') {
        setView('login');
      } else {
        setView('landing');
      }
    };

    // Auto-redirect to chat if logged in and on landing/login pages
    if (isAuthenticated && (view === 'landing' || view === 'login')) {
      setView('chat');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated, view]);

  // Update URL when view changes
  useEffect(() => {
    const path = view === 'adminPanel' ? '/admin' :
      view === 'admin' ? '/kb' :
        view === 'settings' ? '/settings' :
          view === 'chat' ? '/chat' :
            view === 'login' ? '/login' :
              view === 'landing' ? '/' : '/chat';

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }, [view]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);


  // ==========================================
  // API CALLS (SECURED WITH JWT)
  // ==========================================

  // Fetch sessions list
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sop/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setSessions(data.history);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchSessions();
  }, [isAuthenticated]);

  // Fetch documents (authorized only)
  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sop/documents?userRole=${user.role}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
    formData.append('file', file);
    formData.append('accessLevel', 'employee'); // Default, needs UI selector

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatus('success');
        setTimeout(() => setUploadStatus(null), 3000);
        if (view === 'admin') fetchDocuments();
      } else {
        alert(data.message || t.uploadFailed);
      }
    } catch (err) {
      alert(t.uploadFailed);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  // SECURE SEND MESSAGE (RAG PIPELINE)
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sop/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: currentInput,
          userRole: user.role, // Pass actual role
          sessionId: activeChatId,
          models: {
            generation: selectedModel
          }
        })
      });
      const data = await res.json();

      if (data.success) {
        const aiMsg = {
          role: 'ai',
          text: data.answer,
          sources: data.sources || []
        };
        setMessages(prev => [...prev, aiMsg]);

        if (!activeChatId && data.sessionId) {
          setActiveChatId(data.sessionId);
          fetchSessions();
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.answer || t.serverError, error: true }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: t.serverError, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const deleteDoc = async (filename) => {
    if (!confirm(`${t.deleteConfirm} ${filename}?`)) return;
    try {
      // NOTE: Admin endpoints need to be updated to confirm they are secure too
      // For now, this assumes proper backend protection
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/documents/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) fetchDocuments();
    } catch (err) {
      alert(t.deleteFailed);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
    setInput('');
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    setView('chat');
  };

  const handleSessionClick = async (id) => {
    try {
      setActiveChatId(id);
      setView('chat');

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sop/session/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success && data.session) {
        setMessages(data.session.messages);
      }
    } catch (err) {
      console.error("Error loading chat:", err);
    }
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  // ==========================================
  // VIEW LOGIC (CONDITIONAL RETURNS)
  // ==========================================

  // 1. Loading State
  if (authLoading) {
    return <div className="flex h-screen items-center justify-center bg-zinc-900 text-zinc-100">Loading...</div>;
  }

  // 2. Unauthenticated Flow
  if (!isAuthenticated) {
    if (view === 'login') {
      // Show Login Page
      return <Login />;
    }
    // Default: Show Landing Page
    // Clicking "Get Started" goes to 'login' view, triggering <Login />
    return <LandingPage onGetStarted={() => setView('login')} />;
  }

  // 3. Authenticated Flow
  // Only Admin can see Admin Panel
  if (view === 'adminPanel') {
    if (user?.role !== 'admin') {
      setView('chat');
      return null;
    }
    return (
      <div className={`min-h-screen ${theme === 'light' ? 'bg-zinc-50' : 'bg-[#0a0a0a]'} text-zinc-100 font-sans`}>
        <AdminPanel
          theme={theme}
          // Pass dummy props or connect to real user mgmt later
          usersList={[]}
          setUsersList={() => { }}
          modelsList={modelsList}
          setModelsList={setModelsList}
          setView={setView}
          token={token}
        />
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${theme === 'light' ? 'bg-white text-zinc-800' : 'bg-[#212121] text-zinc-100'} font-sans overflow-hidden`}>
      {/* SIDEBAR */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleNewChat={handleNewChat}
        sessions={sessions}
        activeChatId={activeChatId}
        handleSessionClick={handleSessionClick}
        userName={user?.username || 'User'}
        userRole={user?.role || 'employee'}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        theme={theme}
        t={t}
        onLogout={logout}
      />

      {/* OVERLAY for Mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full relative w-full min-w-0">

        {/* HEADER */}
        <ChatHeader
          setIsSidebarOpen={setIsSidebarOpen}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          currentUserRole={user?.role}
          setView={setView}
          theme={theme}
        />

        {/* VIEW AREA */}
        {view === 'settings' ? (
          /* Settings View */
          <SettingsView
            t={t}
            theme={theme}
            setTheme={setTheme}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            userName={user?.username || 'User'}
            setUserName={() => { }} // Disabled editing for now
            userEmail={user?.email}
            setUserEmail={() => { }}
            language={language}
            setLanguage={setLanguage}
            accentMap={accentMap}
            setView={setView}
            setUsersList={() => { }}
          />
        ) : view === 'admin' ? (
          <KnowledgeBaseView
            documents={documents}
            deleteDoc={deleteDoc}
            handlePlusClick={handlePlusClick}
            currentUserRole={user?.role}
            theme={theme}
            t={t}
            onBack={() => setView('chat')} // Back button handler
          />
        ) : (
          /* CHAT VIEW - STREAM STYLE */
          <div className="flex-1 flex flex-col items-center relative h-full">

            <div className="flex-1 w-full overflow-y-auto w-full scroll-smooth custom-scrollbar">
              {messages.length === 0 ? (
                /* EMPTY STATE */
                <EmptyState t={t} theme={theme} setInput={setInput} />
              ) : (
                /* MESSAGES STREAM */
                <MessageList
                  messages={messages}
                  loading={loading}
                  userName={user?.username || 'User'}
                  messagesEndRef={messagesEndRef}
                  theme={theme}
                  t={t}
                />
              )}
            </div>

            {/* INPUT AREA */}
            <ChatInput
              input={input}
              setInput={setInput}
              handleSendMessage={handleSendMessage}
              handlePlusClick={handlePlusClick}
              uploading={uploading}
              theme={theme}
              t={t}
            />
          </div>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
      </div>
    </div>
  );
}
