import ChatWindow from '../ChatWindow/ChatWindow';
import MessageInput from '../MessageInput/MessageInput';
import styles from './ChatContent.module.css';
import { Spin } from 'antd';

export default function ChatContent({
    activeChatId, loadingMessages, messages,
    onSendMessage, onStop, isStreaming, isTyping,  
    sendingMessages, title
}) {
    
    if (!activeChatId) {
        return <div className={styles.empty}>Выберите чат</div>;
    }

    if (loadingMessages && (!messages || messages.length === 0)) {
        return (
            <div className={styles.empty}>
                <Spin size="large" tip="Загрузка сообщений..." />
            </div>
        );
    }
    
    if ((!messages || messages.length === 0) && !sendingMessages && activeChatId) {
        return (
            <div className={styles.welcomeContainer}>
                <div className={styles.welcomeMessage}>
                    <h2>Добро пожаловать в чат!</h2>
                    <p>Напишите первый запрос, чтобы начать диалог</p>
                </div>
                <div className={styles.inputWrapper}> 
                    <MessageInput 
                        onSend={onSendMessage}
                        loading={sendingMessages}
                        isStreaming={isStreaming}     
                        onStop={onStop}                
                    />
                </div>
            </div>
        );
    }
    return (
        <ChatWindow
            messages={messages}
            onSend={onSendMessage}
            onStop={onStop}
            loading={sendingMessages}
            isStreaming={isStreaming}
            isTyping={isTyping}   
            title={title}
        />
    );
}