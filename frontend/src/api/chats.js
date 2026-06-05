import { client } from './client';

export const apiGetChats = () => {
    return client('/chats', { method: 'GET' });
};

export const apiSearchedChats = (query) => {
    return client(`/chats?q=${encodeURIComponent(query)}`, { method: 'GET' });
};

export const apiCreateChat = (title) => {
    return client('/chats', { method: 'POST', body: { title } });
};

export const apiDeleteChat = (chatId) => {
    return client(`/chats/${chatId}`, { method: 'DELETE' });
};