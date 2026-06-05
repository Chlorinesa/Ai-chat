import { API_BASE_URL } from '../constants/api.js';
import { client } from './client';

export const apiGetMessages = (chatId) => {
    return client(`/chats/${chatId}/messages`, { method: 'GET' });
};

export const apiSendMessage = (chatId, message) => {
    return client(`/chats/${chatId}/messages`, { method: 'POST', body: { message } });
};

export const apiSendMessageStream = async (chatId, message, callbacks) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                callbacks.onDone?.();
                return;
            }

            buffer += decoder.decode(value, { stream: true });

            let eventEnd;
            while ((eventEnd = buffer.indexOf('\n\n')) !== -1) {
                const eventBlock = buffer.slice(0, eventEnd);
                buffer = buffer.slice(eventEnd + 2);

                const lines = eventBlock.split('\n');
                let eventType = '';
                let eventData = '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('event:')) {
                        eventType = trimmed.slice(6).trim();
                    } else if (trimmed.startsWith('data:')) {
                        eventData = trimmed.slice(5).trim();
                    }
                }

                if (!eventData) continue;

                try {
                    const data = JSON.parse(eventData);

                    switch (eventType) {
                        case 'start':
                            callbacks.onStart?.(data);
                            break;
                        case 'chunk':
                            callbacks.onChunk?.(data.content);
                            break;
                        case 'done':
                            callbacks.onDone?.(data);
                            return;
                        case 'error':
                            callbacks.onError?.(new Error(data.message || 'Streaming error'));
                            return;
                    }
                } catch (e) {
                    console.error('SSE parse error:', e, eventData);
                }
            }
        }
    } catch (error) {
        callbacks.onError?.(error);
        throw error;
    } finally {
        reader.releaseLock();
    }
};