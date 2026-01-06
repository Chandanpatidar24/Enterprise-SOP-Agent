import { useState, useEffect } from 'react';

export const useNavigation = (isAuthenticated) => {
    const [view, setView] = useState(() => {
        const path = window.location.pathname;
        if (path === '/kb') return 'admin';
        if (path === '/settings') return 'settings';
        if (path === '/admin') return 'adminPanel';
        if (path === '/chat') return 'chat';
        if (path === '/login') return 'login';
        return 'landing';
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeChatId, setActiveChatId] = useState(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            if (path === '/admin') setView('adminPanel');
            else if (path === '/kb') setView('admin');
            else if (path === '/settings') setView('settings');
            else if (path === '/chat') setView('chat');
            else if (path === '/login') setView('login');
            else if (path === '/signup') { setView('login'); setAuthMode('signup'); }
            else setView('landing');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Update URL when view changes
    useEffect(() => {
        const path = view === 'adminPanel' ? '/admin' :
            view === 'admin' ? '/kb' :
                view === 'settings' ? '/settings' :
                    view === 'chat' ? '/chat' :
                        view === 'login' ? (authMode === 'signup' ? '/signup' : '/login') :
                            view === 'landing' ? '/' : '/chat';

        if (window.location.pathname !== path) {
            window.history.pushState({}, '', path);
        }
    }, [view, authMode]);

    return {
        view,
        setView,
        isSidebarOpen,
        setIsSidebarOpen,
        activeChatId,
        setActiveChatId,
        showUpgradeModal,
        setShowUpgradeModal,
        handleNewChat: (setMessages, setInput) => {
            setMessages([]);
            setActiveChatId(null);
            setInput('');
            if (window.innerWidth < 768) setIsSidebarOpen(false);
            setView('chat');
        },
        openAuth: (mode = 'login') => {
            setAuthMode(mode);
            setView('login');
        },
        authMode,
        isProfileOpen,
        setIsProfileOpen,
        isAdminAuthenticated,
        setIsAdminAuthenticated
    };
};
