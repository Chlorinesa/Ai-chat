import { useState, useEffect, useCallback, useRef, useMemo, act } from 'react';
import { apiGetChats, apiCreateChat, apiDeleteChat } from '../api/chats';
import { apiGetMessages, apiSendMessageStream } from '../api/messages';
import { message } from 'antd';

const TYPEWRITER_INTERVAL = 100;   
const TYPEWRITER_CHUNK = 1;      

export const useChat = () => {

    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(() => {
        const saved = localStorage.getItem('activeChatId');
        return saved ? Number(saved) : null;
    });

    const [messages, setMessages] = useState([]);
    const [pendingByChat, setPendingByChat] = useState({});
    const [streamingByChat, setStreamingByChat] = useState({});

    const [loadingChats, setLoadingChats] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingChatIds, setSendingChatIds] = useState(() => new Set());

    const [typingByChat, setTypingByChat] = useState({});

    const abortControllersRef = useRef({});
    const charBuffersRef = useRef({});

    const activeChatIdRef = useRef(activeChatId);
    useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);

    useEffect(() => {
        activeChatId
            ? localStorage.setItem('activeChatId', activeChatId)
            : localStorage.removeItem('activeChatId');
    }, [activeChatId]);

    useEffect(() => {
        if (chats.length > 0 && activeChatId) {
            if (!chats.find(c => c.id === activeChatId)) {
                setActiveChatId(null);
                setMessages([]);
            }
        }
    }, [chats, activeChatId]);

    useEffect(() => {
        return () => {
            Object.values(charBuffersRef.current).forEach(buf => {
                if (buf?.intervalId) clearInterval(buf.intervalId);
            });
        };
    }, []);

    const loadChats = useCallback(async () => {
        setLoadingChats(true);
        try {
            const response = await apiGetChats();
            if (response?.chats) setChats(response.chats);
        } catch (error) {
            console.error('loadChats error:', error);
        } finally {
            setLoadingChats(false);
        }
    }, []);

    const loadMessages = useCallback(async (chatId) => {
        setLoadingMessages(true);
        try {
            const response = await apiGetMessages(chatId);
            if (response?.messages) {
                if (activeChatIdRef.current === chatId) {
                    setMessages(response.messages);
                }
            }
        } catch (error) {
            console.error('loadMessages error:', error);
        } finally {
            if (activeChatIdRef.current === chatId) {
                setLoadingMessages(false);
            }
        }
    }, []);

    const createChat = useCallback(async () => {
        try {
            const response = await apiCreateChat('Новый чат');
            if (response?.chat_id) {
                const newChat = { id: response.chat_id, title: 'Новый чат' };
                setChats(prev => [newChat, ...prev]);
                setActiveChatId(response.chat_id);
                message.success('Чат создан');
            }
        } catch (error) {
            message.error(error.message || 'Ошибка создания чата');
        }
    }, []);

    const deleteChat = useCallback(async (chatId) => {
        try {
            await apiDeleteChat(chatId);
            setChats(prev => prev.filter(chat => chat.id !== chatId));

            setPendingByChat(prev => {
                const next = { ...prev };
                delete next[chatId];
                return next;
            });
            setStreamingByChat(prev => {
                const next = { ...prev };
                delete next[chatId];
                return next;
            });

            if (charBuffersRef.current[chatId]) {
                clearInterval(charBuffersRef.current[chatId].intervalId);
                delete charBuffersRef.current[chatId];
            }

            if (activeChatId === chatId) {
                setActiveChatId(null);
                setMessages([]);
            }
            setSendingChatIds(prev => {
                const next = new Set(prev);
                next.delete(chatId);
                return next;
            });
            message.success('Чат удалён');
        } catch (error) {
            message.error(error.message || 'Ошибка удаления чата');
        }
    }, [activeChatId]);

    const startTypewriter = useCallback((chatId) => {
        if (charBuffersRef.current[chatId]?.intervalId) {
            clearInterval(charBuffersRef.current[chatId].intervalId);
        }

        const intervalId = setInterval(() => {
            const buf = charBuffersRef.current[chatId];
            if (!buf) return;

            if (buf.buffer.length === 0) return;

            const charsToAdd = buf.buffer.slice(0, TYPEWRITER_CHUNK);
            buf.buffer = buf.buffer.slice(TYPEWRITER_CHUNK);
            buf.displayed += charsToAdd;

            setStreamingByChat(prev => {
                const current = prev[chatId];
                if (!current) return prev;
                return {
                    ...prev,
                    [chatId]: {
                        ...current,
                        content: buf.displayed
                    }
                };
            });
        }, TYPEWRITER_INTERVAL);

        charBuffersRef.current[chatId] = {
            ...charBuffersRef.current[chatId],
            intervalId
        };
    }, []);

    const stopTypewriter = useCallback((chatId) => {
        const buf = charBuffersRef.current[chatId];
        if (buf?.intervalId) {
            clearInterval(buf.intervalId);
        }
        delete charBuffersRef.current[chatId];
    }, []);

    // === Функция вывода остатка буфера сразу ===
    const flushBuffer = useCallback((chatId) => {
        const buf = charBuffersRef.current[chatId];
        if (!buf || buf.buffer.length === 0) return;

        const remaining = buf.buffer;
        buf.buffer = '';
        buf.displayed += remaining;

        setStreamingByChat(prev => {
            const current = prev[chatId];
            if (!current) return prev;
            return {
                ...prev,
                [chatId]: {
                    ...current,
                    content: buf.displayed
                }
            };
        });
    }, []);

    const sendMessage = useCallback(async (text) => {
        if (!text?.trim()) return;
        if (!activeChatId) {
            message.error('Выберите чат');
            return;
        }

        const chatId = activeChatId;

        setPendingByChat(prev => ({
            ...prev,
            [chatId]: {
                id: `pending_${Date.now()}`,
                role: 'user',
                content: text,
                created_at: new Date().toISOString()
            }
        }));

        setSendingChatIds(prev => new Set(prev).add(chatId));

        charBuffersRef.current[chatId] = {
            buffer: '',
            displayed: '',
            intervalId: null
        };

        let isDone = false;
        let wasCancelled = false;

        let timeoutId = setTimeout(() => {
            if (!isDone) {
                isDone = true;
                fullCleanup();
            }
        }, 330000);

        const partialCleanup = () => {
            clearTimeout(timeoutId);
            stopTypewriter(chatId);
            setPendingByChat(prev => {
                const next = { ...prev };
                delete next[chatId];
                return next;
            });
            setSendingChatIds(prev => {
                const next = new Set(prev);
                next.delete(chatId);
                return next;
            });
            setTypingByChat(prev => {
                const next = {...prev};
                delete next[chatId];
                return next;
            });
        };

        const fullCleanup = () => {
            clearTimeout(timeoutId);
            stopTypewriter(chatId);
            setPendingByChat(prev => {
                const next = { ...prev };
                delete next[chatId];
                return next;
            });
            setStreamingByChat(prev => {
                const next = { ...prev };
                delete next[chatId];
                return next;
            });
            setSendingChatIds(prev => {
                const next = new Set(prev);
                next.delete(chatId);
                return next;
            });
            setTypingByChat(prev => {
                const next = {...prev};
                delete next[chatId];
                return next;
            });
        };

        const abortController = new AbortController();
        abortControllersRef.current[chatId] = abortController;

        try {
            await apiSendMessageStream(chatId, text, {
                onStart: () => {
                    setTypingByChat(prev =>( {...prev, [chatId]:true}));
                    startTypewriter(chatId);
                },
                onChunk: (chunk) => {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        if (!isDone) {
                            isDone = true;
                            fullCleanup();
                        }
                    }, 330000);

                    setTypingByChat(prev => {
                        const next = {...prev};
                        delete next[chatId];
                        return next;
                    });

                    setStreamingByChat(prev => ({
                        ...prev,
                        [chatId]: {
                            id: `streaming_${Date.now()}`,
                            role: 'assistant',
                            content: '',
                            created_at: new Date().toISOString()
                        }
                    }));

                    const buf = charBuffersRef.current[chatId];
                    if (buf) {
                        buf.buffer += chunk;
                    }
                },
                onDone: (data) => {
                    if (isDone) return;
                    isDone = true;

                    if (data?.cancelled) {
                        wasCancelled = true;
                        delete abortControllersRef.current[chatId];
                        fullCleanup();
                        return;
                    }

                    delete abortControllersRef.current[chatId];

                    // === ВЫВОДИМ ОСТАТОК БУФЕРА СРАЗУ ===
                    flushBuffer(chatId);
                    stopTypewriter(chatId);

                    partialCleanup();

                    Promise.all([
                        loadMessages(chatId),
                        loadChats()
                    ]).then(() => {
                        setStreamingByChat(prev => {
                            const next = { ...prev };
                            delete next[chatId];
                            return next;
                        });
                        setSendingChatIds(prev => {
                            const next = new Set(prev);
                            next.delete(chatId);
                            return next;
                        });
                    }).catch(() => {
                        setStreamingByChat(prev => {
                            const next = { ...prev };
                            delete next[chatId];
                            return next;
                        });
                        setSendingChatIds(prev => {
                            const next = new Set(prev);
                            next.delete(chatId);
                            return next;
                        });
                    });
                },
                onError: (error) => {
                    if (isDone) return;
                    isDone = true;
                    fullCleanup();
                    message.error(error.message || 'Ошибка отправки сообщения');
                }
            }, abortController);

        } catch (error) {
            if (!isDone) {
                isDone = true;
                fullCleanup();
                message.error(error.message || 'Ошибка соединения');
            }
        }
    }, [activeChatId, loadChats, loadMessages, startTypewriter, stopTypewriter, flushBuffer]);

    const stopStreaming = useCallback(() => {
        const chatId = activeChatId;
        if (!chatId) return;

        if (abortControllersRef.current[chatId]) {
            abortControllersRef.current[chatId].abort();
            delete abortControllersRef.current[chatId];
        }

        stopTypewriter(chatId);

        setStreamingByChat(prev => {
            const next = { ...prev };
            delete next[chatId];
            return next;
        });
        setSendingChatIds(prev => {
            const next = new Set(prev);
            next.delete(chatId);
            return next;
        });
        setTypingByChat(prev => {
            const next = {...prev};
            delete next[chatId];
            return next;
        });
    }, [activeChatId, stopTypewriter]);

    const sendingMessages = activeChatId ? sendingChatIds.has(activeChatId) : false;

    useEffect(() => { loadChats(); }, [loadChats]);

    useEffect(() => {
        if (activeChatId) {
            loadMessages(activeChatId);
        }
    }, [activeChatId, loadMessages]);

    const pendingUserMessage = activeChatId ? pendingByChat[activeChatId] || null : null;
    const streamingAssistant = activeChatId ? streamingByChat[activeChatId] || null : null;
    const isStreaming = !!abortControllersRef.current[activeChatId];
    const isTyping = activeChatId ? typingByChat[activeChatId] || false: false;

    const displayMessages = useMemo(() => {
        const result = [...messages];
        const lastDbMessage = messages[messages.length - 1];

        const isDuplicate = pendingUserMessage &&
            lastDbMessage?.role === 'user' &&
            lastDbMessage?.content === pendingUserMessage.content;

        if (pendingUserMessage && !isDuplicate) {
            result.push(pendingUserMessage);
        }

        if (streamingAssistant) {
            result.push(streamingAssistant);
        }

        return result;
    }, [messages, pendingUserMessage, streamingAssistant]);

    return {
        chats, activeChatId, messages: displayMessages,
        loadingChats, loadingMessages, sendingMessages,
        setActiveChatId, createChat, deleteChat, sendMessage,
        isStreaming, isTyping, stopStreaming
    };
};