import { SendHorizontal, Plus, Loader2, FileCheck, Trash2, Database, MessageSquare, AlertCircle, Menu, Settings, LogOut, User, X, ArrowLeft, ChevronDown, Check, Shield, Users, Cpu, Lock, Eye } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import CustomDropdown from './components/CustomDropdown';
import AdminPanel from './components/AdminPanel/AdminPanel';
import SettingsView from './components/Settings/Settings';

const translations = {
  en: {
    newChat: "New Chat",
    settings: "Settings",
    knowledgeBase: "Knowledge Base",
    profile: "Profile",
    displayName: "Display Name",
    emailAddress: "Email Address",
    appearance: "Appearance",
    themePreference: "Theme Preference",
    themeSub: "Choose your interface style",
    accentColor: "Accent Color",
    accentSub: "Personalize your experience",
    regional: "Regional",
    language: "Language",
    languageSub: "Select your preferred language",
    dangerZone: "Danger Zone",
    deleteAccount: "Delete Account",
    deleteAccountSub: "Permanently remove your account and data",
    footer: "OpsMind AI v4.0.2 • Enterprise Edition",
    kbSubtitle: "Manage the brain of your agent.",
    uploadSop: "Upload SOP",
    noKnowledge: "No knowledge yet. Upload a PDF to get started.",
    greeting: "How can I help you today?",
    placeholder: "Message OpsMind...",
    disclaimer: "OpsMind can make mistakes. Consider checking important information.",
    suggestion1: "Summarize the IT Security Policy",
    suggestion2: "How do I update my HR details?",
    suggestion3: "What is the protocol for data breaches?",
    suggestion4: "Explain the remote work guidelines",
    uploadFailed: "Upload failed",
    deleteFailed: "Delete failed",
    deleteConfirm: "Are you sure you want to delete",
    deleteAccountConfirm: "Are you surely you want to delete your account? This action is irreversible.",
    accountDeletionNotSupported: "Account deletion is not supported in this demo.",
    clearAll: "Clear all?",
    clearAllChats: "Clear all chats",
    deleteLocalHistory: "Delete local history",
    done: "Done",
    today: "Today",
    you: "You",
    errorConnecting: "Error connecting to knowledge base.",
    serverError: "Sorry, I can't connect to the server right now."
  },
  es: {
    newChat: "Nuevo Chat",
    settings: "Configuración",
    knowledgeBase: "Base de Conocimiento",
    profile: "Perfil",
    displayName: "Nombre Visible",
    emailAddress: "Correo Electrónico",
    appearance: "Apariencia",
    themePreference: "Preferencia de Tema",
    themeSub: "Elige tu estilo de interfaz",
    accentColor: "Color de Acento",
    accentSub: "Personaliza tu experiencia",
    regional: "Regional",
    language: "Idioma",
    languageSub: "Selecciona tu idioma preferido",
    dangerZone: "Zona de Peligro",
    deleteAccount: "Eliminar Cuenta",
    deleteAccountSub: "Eliminar permanentemente tu cuenta y datos",
    footer: "OpsMind AI v4.0.2 • Edición Empresarial",
    kbSubtitle: "Administra el cerebro de tu agente.",
    uploadSop: "Subir SOP",
    noKnowledge: "No hay conocimiento aún. Sube un PDF para empezar.",
    greeting: "¿Cómo puedo ayudarte hoy?",
    placeholder: "Escribe a OpsMind...",
    disclaimer: "OpsMind puede cometer errores. Considera verificar información importante.",
    suggestion1: "Resumir la Política de Seguridad TI",
    suggestion2: "¿Cómo actualizo mis datos de RRHH?",
    suggestion3: "¿Cuál es el protocolo para brechas de datos?",
    suggestion4: "Explica las pautas de trabajo remoto",
    uploadFailed: "Error al subir",
    deleteFailed: "Error al eliminar",
    deleteConfirm: "¿Seguro que quieres eliminar",
    deleteAccountConfirm: "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.",
    accountDeletionNotSupported: "La eliminación de cuenta no está soportada en esta demo.",
    clearAll: "¿Borrar todo?",
    clearAllChats: "Borrar todos los chats",
    deleteLocalHistory: "Eliminar historial local",
    done: "Hecho",
    today: "Hoy",
    you: "Tú",
    errorConnecting: "Error al conectar con la base de conocimiento.",
    serverError: "Lo siento, no puedo conectarme al servidor ahora."
  },
  fr: {
    newChat: "Nouvelle Discussion",
    settings: "Paramètres",
    knowledgeBase: "Base de Connaissances",
    profile: "Profil",
    displayName: "Nom d'affichage",
    emailAddress: "Adresse E-mail",
    appearance: "Apparence",
    themePreference: "Préférence de Thème",
    themeSub: "Choisissez votre style d'interface",
    accentColor: "Couleur d'Accent",
    accentSub: "Personnalisez votre expérience",
    regional: "Régional",
    language: "Langue",
    languageSub: "Sélectionnez votre langue préférée",
    dangerZone: "Zone de Danger",
    deleteAccount: "Supprimer le Compte",
    deleteAccountSub: "Supprimer définitivement votre compte et vos données",
    footer: "OpsMind AI v4.0.2 • Édition Entreprise",
    kbSubtitle: "Gérez le cerveau de votre agent.",
    uploadSop: "Télécharger SOP",
    noKnowledge: "Aucune connaissance pour le moment. Téléchargez un PDF pour commencer.",
    greeting: "Comment puis-je vous aider aujourd'hui ?",
    placeholder: "Message à OpsMind...",
    disclaimer: "OpsMind peut faire des erreurs. Pensez à vérifier les informations importantes.",
    suggestion1: "Résumer la politique de sécurité informatique",
    suggestion2: "Comment mettre à jour mes coordonnées RH ?",
    suggestion3: "Quel est le protocole en cas de violation de données ?",
    suggestion4: "Expliquer les directives de travail à distance",
    uploadFailed: "Échec du téléchargement",
    deleteFailed: "Échec de la suppression",
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer",
    deleteAccountConfirm: "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
    accountDeletionNotSupported: "La suppression de compte n'est pas prise en charge dans cette démo.",
    clearAll: "Tout effacer ?",
    clearAllChats: "Effacer toutes les discussions",
    deleteLocalHistory: "Supprimer l'historique local",
    done: "Terminé",
    today: "Aujourd'hui",
    you: "Vous",
    errorConnecting: "Erreur de connexion à la base de connaissances.",
    serverError: "Désolé, je ne peux pas me connecter au serveur pour le moment."
  },
  de: {
    newChat: "Neuer Chat",
    settings: "Einstellungen",
    knowledgeBase: "Wissensdatenbank",
    profile: "Profil",
    displayName: "Anzeigename",
    emailAddress: "E-Mail-Adresse",
    appearance: "Aussehen",
    themePreference: "Design-Präferenz",
    themeSub: "Wählen Sie Ihren Schnittstellenstil",
    accentColor: "Akzentfarbe",
    accentSub: "Personalisieren Sie Ihr Erlebnis",
    regional: "Regional",
    language: "Sprache",
    languageSub: "Wählen Sie Ihre bevorzugte Sprache",
    dangerZone: "Gefahrenzone",
    deleteAccount: "Konto Löschen",
    deleteAccountSub: "Ihr Konto und Ihre Daten dauerhaft entfernen",
    footer: "OpsMind AI v4.0.2 • Enterprise Edition",
    kbSubtitle: "Verwalten Sie das Gehirn Ihres Agenten.",
    uploadSop: "SOP Hochladen",
    noKnowledge: "Noch kein Wissen. Laden Sie ein PDF hoch, um zu beginnen.",
    greeting: "Wie kann ich Ihnen heute helfen?",
    placeholder: "Nachricht an OpsMind...",
    disclaimer: "OpsMind kann Fehler machen. Überprüfen Sie wichtige Informationen.",
    suggestion1: "Fassen Sie die IT-Sicherheitsrichtlinie zusammen",
    suggestion2: "Wie aktualisiere ich meine HR-Daten?",
    suggestion3: "Was ist das Protokoll für Datenschutzverletzungen?",
    suggestion4: "Erklären Sie die Richtlinien für Fernarbeit",
    uploadFailed: "Hochladen fehlgeschlagen",
    deleteFailed: "Löschen fehlgeschlagen",
    deleteConfirm: "Sind Sie sicher, dass Sie löschen möchten",
    deleteAccountConfirm: "Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion ist irreversibel.",
    accountDeletionNotSupported: "Das Löschen von Konten wird in dieser Demo nicht unterstützt.",
    clearAll: "Alles löschen?",
    clearAllChats: "Alle Chats löschen",
    deleteLocalHistory: "Lokalen Verlauf löschen",
    done: "Erledigt",
    today: "Heute",
    you: "Du",
    errorConnecting: "Fehler bei der Verbindung zur Wissensdatenbank.",
    serverError: "Entschuldigung, ich kann mich derzeit nicht mit dem Server verbinden."
  },
  ja: {
    newChat: "新しいチャット",
    settings: "設定",
    knowledgeBase: "ナレッジベース",
    profile: "プロフィール",
    displayName: "表示名",
    emailAddress: "メールアドレス",
    appearance: "外観",
    themePreference: "テーマ設定",
    themeSub: "インターフェーススタイルを選択",
    accentColor: "アクセントカラー",
    accentSub: "体験をカスタマイズ",
    regional: "地域",
    language: "言語",
    languageSub: "優先言語を選択",
    dangerZone: "危険地帯",
    deleteAccount: "アカウント削除",
    deleteAccountSub: "アカウントとデータを完全に削除",
    footer: "OpsMind AI v4.0.2 • エンタープライズ版",
    kbSubtitle: "エージェントの頭脳を管理します。",
    uploadSop: "SOPをアップロード",
    noKnowledge: "知識はまだありません。PDFをアップロードして始めましょう。",
    greeting: "今日はどのようなお手伝いができますか？",
    placeholder: "OpsMindにメッセージ...",
    disclaimer: "OpsMindは間違いを犯す可能性があります。重要な情報を確認してください。",
    suggestion1: "ITセキュリティポリシーを要約して",
    suggestion2: "HRの詳細を更新するにはどうすればよいですか？",
    suggestion3: "データ侵害のプロトコルは何ですか？",
    suggestion4: "リモートワークのガイドラインを説明して",
    uploadFailed: "アップロードに失敗しました",
    deleteFailed: "削除に失敗しました",
    deleteConfirm: "本当に削除しますか",
    deleteAccountConfirm: "本当にアカウントを削除しますか？この操作は取り消せません。",
    accountDeletionNotSupported: "このデモではアカウント削除はサポートされていません。",
    clearAll: "すべてクリア？",
    clearAllChats: "すべてのチャットをクリア",
    deleteLocalHistory: "ローカル履歴を削除",
    done: "完了",
    today: "今日",
    you: "あなた",
    errorConnecting: "ナレッジベースへの接続エラー。",
    serverError: "申し訳ありませんが、現在サーバーに接続できません。"
  }
};

// CustomDropdown component moved to ./components/CustomDropdown.jsx

export default function App() {
  const [view, setView] = useState('chat'); // 'chat', 'admin', 'settings'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [theme, setTheme] = useState('dark');

  // Settings States
  const [accentColor, setAccentColor] = useState('blue');
  const [userName, setUserName] = useState('Admin User');
  const [userEmail, setUserEmail] = useState('admin@opsmind.ai');
  const [currentUserRole, setCurrentUserRole] = useState('admin'); // 'admin', 'manager', 'user'
  const [language, setLanguage] = useState('en');
  const t = translations[language];

  // RBAC Mock Data
  const [usersList, setUsersList] = useState([
    { id: 1, name: 'Admin User', email: 'admin@opsmind.ai', role: 'admin' },
    { id: 2, name: 'Manager John', email: 'john@opsmind.ai', role: 'manager' },
    { id: 3, name: 'User Sarah', email: 'sarah@opsmind.ai', role: 'user' },
  ]);
  const [modelsList, setModelsList] = useState([
    { id: 'gpt4', name: 'GPT-4 Turbo', access: ['admin', 'manager'] },
    { id: 'claude3', name: 'Claude 3 Opus', access: ['admin'] },
    { id: 'gemini', name: 'Gemini Pro', access: ['admin', 'manager', 'user'] },
  ]);

  // Sidebar & Profile States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  // Admin Auth State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setShowAdminLogin(false);
      setAdminPassword('');
      setView('superAdmin');
    } else {
      alert('Invalid Password');
    }
  };

  // Removed duplicate lines
  const messagesEndRef = useRef(null);

  const accentMap = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-emerald-500',
    orange: 'bg-orange-500',
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Fetch sessions list
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/sessions`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.history);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

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
      alert(t.uploadFailed);
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
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentInput,
          sessionId: activeChatId,
          language: language // Pass language to backend if needed
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

        // If this was a new chat (no active ID), set the returned ID and refresh history
        if (!activeChatId && data.sessionId) {
          setActiveChatId(data.sessionId);
          fetchSessions();
        }
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/documents/${filename}`, { method: 'DELETE' });
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
    if (view === 'settings') setView('chat');
  };

  const handleSessionClick = async (id) => {
    try {
      setActiveChatId(id);
      if (view === 'settings') setView('chat');

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/sessions/${id}`);
      const data = await res.json();

      if (data.success && data.session) {
        setMessages(data.session.messages);
      }
    } catch (err) {
      console.error("Error loading chat:", err);
    }
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className={`flex h-screen ${theme === 'light' ? 'bg-white text-zinc-800' : 'bg-[#212121] text-zinc-100'} font-sans overflow-hidden`}>
      {/* SIDEBAR */}
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
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center gap-3 w-full px-2 py-2 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-zinc-100' : 'hover:bg-[#212121]'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${accentMap[accentColor]}`}>
                {userName.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{userName}</div>
              </div>
              <Settings size={16} className="text-zinc-500" />
            </button>
          </div>
        </div>
      </aside>

      {/* OVERLAY for Mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm p-6 rounded-2xl border ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#171717] border-zinc-700'} shadow-2xl scale-100`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Admin Verification</h3>
              <button onClick={() => setShowAdminLogin(false)} className="text-zinc-500 hover:text-zinc-300"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-2">Password</label>
                <input
                  type="password"
                  autoFocus
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin key..."
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-[#212121] border-zinc-700 text-white'
                    }`}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Unlock Panel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full relative w-full min-w-0">

        {/* HEADER */}
        <header className="flex items-center justify-between p-3 md:hidden z-10 sticky top-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm">OpsMind</span>
          <div className="w-8" />
        </header>

        {/* TOP BAR (Desktop) */}
        <div className={`hidden md:flex items-center justify-between px-4 py-3 absolute top-0 left-0 right-0 z-10 backdrop-blur-md border-b transition-colors duration-300 ${theme === 'light' ? 'bg-white/80 border-zinc-200' : 'bg-[#212121]/80 border-white/5'
          }`}>
          <div className="flex items-center gap-2 bg-transparent p-1 rounded-lg">
            <button
              onClick={() => setView('chat')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'chat' ? 'bg-[#2f2f2f] text-white shadow-sm ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
            >
              OpsMind 4.0
            </button>
            {currentUserRole !== 'user' && (
              <button
                onClick={() => setView('admin')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'admin' ? 'bg-[#2f2f2f] text-white shadow-sm ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
              >
                {t.knowledgeBase}
              </button>
            )}
          </div>

          <button onClick={() => setView('settings')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition p-2">
            <Settings size={18} />
          </button>
        </div>

        {/* VIEW AREA */}
        {view === 'settings' ? (
          /* Settings View */
          <SettingsView
            t={t}
            theme={theme}
            setTheme={setTheme}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            userName={userName}
            setUserName={setUserName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            language={language}
            setLanguage={setLanguage}
            accentMap={accentMap}
            setView={setView}
            setShowAdminLogin={setShowAdminLogin}
            currentUserRole={currentUserRole}
            setCurrentUserRole={setCurrentUserRole}
            setUsersList={setUsersList}
          />
        ) : view === 'admin' ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-12 md:pt-20 pt-24">
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{t.knowledgeBase}</h1>
                  <p className="text-zinc-500">{t.kbSubtitle}</p>
                </div>
                {currentUserRole === 'admin' && (
                  <button onClick={handlePlusClick} className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition flex items-center gap-2">
                    <Plus size={18} /> {t.uploadSop}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border group relative overflow-hidden transition-all hover:border-blue-500/50 ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#171717] border-white/5'}`}>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {currentUserRole === 'admin' ? (
                        <button onClick={() => deleteDoc(doc.filename)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white"><Trash2 size={16} /></button>
                      ) : (
                        <div className="p-2 bg-white/5 text-zinc-500 rounded-lg cursor-not-allowed" title="ReadOnly"><Eye size={16} /></div>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 mb-4">
                      <FileCheck size={20} />
                    </div>
                    <h3 className="font-medium truncate mb-1" title={doc.filename}>{doc.filename}</h3>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>{doc.chunkCount} vectors</span>
                      <span>{new Date(doc.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div className="col-span-full py-20 text-center text-zinc-500 border border-dashed border-zinc-700 rounded-xl">
                    <Database className="mx-auto mb-4 opacity-30" size={48} />
                    <p>{t.noKnowledge}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : view === 'superAdmin' ? (
          /* SUPER ADMIN PANEL */
          <AdminPanel
            theme={theme}
            usersList={usersList}
            setUsersList={setUsersList}
            modelsList={modelsList}
            setModelsList={setModelsList}
            setView={setView}
          />
        ) : (
          /* CHAT VIEW - STREAM STYLE */
          <div className="flex-1 flex flex-col items-center relative h-full">

            <div className="flex-1 w-full overflow-y-auto w-full scroll-smooth custom-scrollbar">
              {messages.length === 0 ? (
                /* EMPTY STATE */
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
              ) : (
                /* MESSAGES STREAM */
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
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
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
              )}
            </div>

            {/* INPUT AREA */}
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
                      : 'bg-transparent text-zinc-500'
                      }`}
                  >
                    <SendHorizontal size={18} />
                  </button>

                </form>
                <div className="text-center mt-2">
                  <p className="text-[10px] text-zinc-500">{t.disclaimer}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
      </div>
    </div>
  );
}
