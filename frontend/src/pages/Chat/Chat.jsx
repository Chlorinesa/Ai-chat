import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';
import ChatLayout from '../../components/ChatLayout/ChatLayout';

export default function Chat() {

    const { token } = useAuth();

    const [collapsed, setCollapsed] = useState(false);

    const {
        chats, activeChatId, messages,
        loadingChats, loadingMessages, sendingMessages,
        setActiveChatId, createChat, deleteChat, sendMessage,
        isStreaming,        
        stopStreaming, 
        isTyping
    } = useChat();

    if (!token) return <Navigate to="/login" />;

    return (
        <ChatLayout
            collapsed={collapsed}
            onCollapse={() => setCollapsed(!collapsed)}
            loadingChats={loadingChats}
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
            onCreateChat={createChat}
            onDeleteChat={deleteChat}
            loadingMessages={loadingMessages}
            messages={messages}
            onSendMessage={sendMessage}
            onStop={stopStreaming}       
            isStreaming={isStreaming}  
            isTyping={isTyping}
            sendingMessages={sendingMessages}
            activeChatTitle={chats.find(c => c.id === activeChatId)?.title}
        />
    );
}