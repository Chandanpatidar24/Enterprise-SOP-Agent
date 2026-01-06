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
import AuthView from './components/Auth/AuthView';
import CorporateUpgradeModal from './components/Auth/CorporateUpgradeModal';
import PlanManagementModal from './components/Auth/PlanManagementModal';
import { useAuth } from './context/AuthContext';
import { useNavigation } from './hooks/useNavigation';
import { useSettings } from './hooks/useSettings';
import { useKnowledgeBase } from './hooks/useKnowledgeBase';
import { useChat } from './hooks/useChat';

export default function App() {
  const { user, token, isAuthenticated, logout, loading: authLoading } = useAuth();

  // 1. Navigation Hook
  const nav = useNavigation(isAuthenticated);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // 2. Settings Hook
  const settings = useSettings();
  const { t } = settings;

  // 3. Knowledge Base Hook
  const kb = useKnowledgeBase(token, user, t);

  // 4. Chat Hook
  const chat = useChat(
    token,
    user,
    t,
    nav.activeChatId,
    nav.setActiveChatId,
    settings.selectedModel
  );

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages, chat.loading]);

  // Initial Fetches
  useEffect(() => {
    if (isAuthenticated && user) {
      chat.fetchSessions();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (nav.view === 'admin') kb.fetchDocuments();
  }, [nav.view]);

  const handlePlusClick = () => fileInputRef.current?.click();

  const handleUpgradeSuccess = () => window.location.reload();

  const handleLogout = () => {
    logout();
    nav.setView('landing');
    nav.setIsProfileOpen(false);
    chat.setMessages([]);
    nav.setActiveChatId(null);
  };

  // ==========================================
  // VIEW LOGIC
  // ==========================================

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center bg-zinc-900 text-zinc-100">Loading...</div>;
  }

  // 1. Unauthenticated Gate
  if (!isAuthenticated) {
    if (nav.view === 'login') {
      return (
        <AuthView
          onAuthSuccess={() => nav.setView('chat')}
          initialMode={nav.authMode}
        />
      );
    }
    return (
      <LandingPage
        onLogin={() => nav.openAuth('login')}
        onSignup={() => nav.openAuth('signup')}
      />
    );
  }

  // 2. Authenticated-Only Views (Admin Panel)
  if (nav.view === 'adminPanel') {
    if (user?.role !== 'admin') {
      nav.setView('chat');
      return null;
    }
    return (
      <div className={`min-h-screen ${settings.theme === 'light' ? 'bg-zinc-50' : 'bg-[#0a0a0a]'} text-zinc-100 font-sans`}>
        <AdminPanel
          theme={settings.theme}
          modelsList={settings.modelsList}
          setModelsList={settings.setModelsList}
          setView={nav.setView}
          token={token}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${settings.theme === 'light' ? 'bg-white text-zinc-800' : 'bg-[#212121] text-zinc-100'} font-sans overflow-hidden`}>
      <Sidebar
        isSidebarOpen={nav.isSidebarOpen}
        setIsSidebarOpen={nav.setIsSidebarOpen}
        handleNewChat={() => nav.handleNewChat(chat.setMessages, chat.setInput)}
        sessions={chat.sessions}
        activeChatId={nav.activeChatId}
        handleSessionClick={(id) => chat.handleSessionClick(id, nav.setView, nav.setIsSidebarOpen)}
        userName={user?.username || 'User'}
        userRole={user?.role || 'employee'}
        isProfileOpen={nav.isProfileOpen}
        setIsProfileOpen={nav.setIsProfileOpen}
        theme={settings.theme}
        t={t}
        onLogout={handleLogout}
        onUpgradeClick={() => nav.setShowUpgradeModal(true)}
        onManagePlan={() => setIsPlanModalOpen(true)}
      />

      {nav.isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-20" onClick={() => nav.setIsSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col h-full relative w-full min-w-0">
        <ChatHeader
          setIsSidebarOpen={nav.setIsSidebarOpen}
          selectedModel={settings.selectedModel}
          setSelectedModel={settings.setSelectedModel}
          currentUserRole={user?.role}
          setView={nav.setView}
          theme={settings.theme}
        />

        {nav.view === 'settings' ? (
          <SettingsView
            t={t}
            theme={settings.theme}
            setTheme={settings.setTheme}
            accentColor={settings.accentColor}
            setAccentColor={settings.setAccentColor}
            userName={user?.username || 'User'}
            setUserName={() => { }}
            userEmail={user?.email}
            setUserEmail={() => { }}
            language={settings.language}
            setLanguage={settings.setLanguage}
            accentMap={settings.accentMap}
            setView={nav.setView}
            setUsersList={() => { }}
            token={token} // Needed for account deletion
            onLogout={handleLogout}
          />
        ) : nav.view === 'admin' ? (
          <KnowledgeBaseView
            documents={kb.documents}
            deleteDoc={kb.deleteDoc}
            handlePlusClick={handlePlusClick}
            currentUserRole={user?.role}
            theme={settings.theme}
            t={t}
            onBack={() => nav.setView('chat')}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center relative h-full">
            <div className="flex-1 w-full overflow-y-auto w-full scroll-smooth custom-scrollbar">
              {chat.messages.length === 0 ? (
                <EmptyState t={t} theme={settings.theme} setInput={chat.setInput} />
              ) : (
                <MessageList
                  messages={chat.messages}
                  loading={chat.loading}
                  userName={user?.username || 'User'}
                  messagesEndRef={messagesEndRef}
                  theme={settings.theme}
                  t={t}
                />
              )}
            </div>
            <ChatInput
              input={chat.input}
              setInput={chat.setInput}
              handleSendMessage={chat.handleSendMessage}
              handlePlusClick={handlePlusClick}
              uploading={kb.uploading}
              theme={settings.theme}
              t={t}
            />
          </div>
        )}
        <input type="file" ref={fileInputRef} onChange={(e) => kb.handleFileChange(e, nav.view)} accept="application/pdf" className="hidden" />
      </div>

      <CorporateUpgradeModal
        isOpen={nav.showUpgradeModal}
        onClose={() => nav.setShowUpgradeModal(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
        token={token}
        theme={settings.theme}
      />

      <PlanManagementModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        theme={settings.theme}
      />
    </div>
  );
}
