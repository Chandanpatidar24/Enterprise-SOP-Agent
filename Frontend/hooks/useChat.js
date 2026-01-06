import { useState, useEffect } from 'react';

export const useChat = (token, user, t, activeChatId, setActiveChatId, selectedModel) => {
    const [messages, setMessages] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch sessions list
    const fetchSessions = async () => {
        if (!token || !user) return;
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

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sop/ask-stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    question: currentInput,
                    userRole: user.role,
                    sessionId: activeChatId,
                    models: { generation: selectedModel }
                })
            });

            if (!response.ok) throw new Error('Failed to connect to stream');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiText = "";

            // Add a placeholder message for AI
            setMessages(prev => [...prev, { role: 'ai', text: '', sources: [] }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.trim() || !line.startsWith('data: ')) continue;

                    try {
                        const data = JSON.parse(line.replace('data: ', ''));

                        if (data.token) {
                            aiText += data.token;
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = { ...updated[updated.length - 1], text: aiText };
                                return updated;
                            });
                        }

                        if (data.answer) { // Handle single-shot refusals or errors
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = { ...updated[updated.length - 1], text: data.answer };
                                return updated;
                            });
                        }

                        if (data.done) {
                            if (data.sessionId && !activeChatId) {
                                setActiveChatId(data.sessionId);
                                fetchSessions();
                            }
                            if (data.sources) {
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = { ...updated[updated.length - 1], sources: data.sources };
                                    return updated;
                                });
                            }
                        }
                    } catch (e) {
                        console.warn("Parse error in stream line:", line);
                    }
                }
            }
        } catch (err) {
            console.error("Chat Error:", err);
            setMessages(prev => [...prev, { role: 'ai', text: t.serverError, error: true }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSessionClick = async (id, setView, setIsSidebarOpen) => {
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

    return {
        messages,
        setMessages,
        sessions,
        setSessions,
        input,
        setInput,
        loading,
        setLoading,
        fetchSessions,
        handleSendMessage,
        handleSessionClick
    };
};
