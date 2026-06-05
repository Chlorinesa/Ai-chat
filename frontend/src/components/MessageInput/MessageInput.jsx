import { Input, Button, Tooltip } from "antd";
import { useState } from "react";
import styles from './MessageInput.module.css';
import { SendOutlined, StopOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export default function MessageInput({ onSend, onStop, loading, isStreaming }) {

    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    const handleStop = () => {
        onStop?.();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !loading && !isStreaming) {
            e.preventDefault();
            handleSend();
        }
    };

    const getTooltipTitle = () => {
        if (isStreaming) {
            return "Остановить генерацию";
        }
        if (!message.trim()) {
            return "Введите текст сообщения";
        }
        return "";
    };

    return (
        <div className={styles.container}>
            <TextArea
                className={styles.input}
                placeholder="Сообщение..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                autoSize={{ minRows: 2, maxRows: 6 }}
            />
            <Tooltip 
                title={getTooltipTitle()}
                color="var(--bg-secondary)" 
                overlayInnerStyle={{ color: 'var(--text-color)' }} 
            >
                <span className={styles.sendButtonWrapper}>
                    {isStreaming ? (
                        <Button 
                            className={styles.sendButton}
                            type="primary" 
                            onClick={handleStop} 
                            icon={<StopOutlined />}
                            shape="circle"
                            danger
                        />
                    ) : (
                        <Button 
                            className={styles.sendButton}
                            type="primary" 
                            onClick={handleSend} 
                            disabled={!message.trim() || loading}
                            loading={loading}
                            icon={<SendOutlined />}
                            shape="circle"
                        />
                    )}
                </span>
            </Tooltip>
        </div>
    );
}