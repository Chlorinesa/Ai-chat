import MessageList from '../MessageList/MessageList'
import MessageInput from '../MessageInput/MessageInput'
import styles from './ChatWindow.module.css';
import { Typography } from 'antd';

const { Title } = Typography;

export default function ChatWindow ({ messages, onSend, onStop, loading, isStreaming, isTyping, title }) {
    return (
        <div className={styles.chatWindow}>
            <div className={styles.header}>
                <Title level={4} className={styles.headerText}>{title}</Title>
            </div>
            <div className={styles.content}>
                <MessageList 
                    messages={messages} 
                    loading={loading} 
                    isTyping={isTyping}
                />
                <MessageInput
                    onSend={onSend}
                    onStop={onStop}    
                    loading={loading}
                    isStreaming={isStreaming} 
                />
            </div>
        </div>
    );
}