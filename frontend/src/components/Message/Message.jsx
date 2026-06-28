import { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import styles from './Message.module.css';
import { formatTime } from '../../utils/date';
import MarkdownRenderer from './MarkdownRenderer';

export default function Message({ role, content, createdAt, isLastStreaming }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    const tooltipOverlayStyle = {
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-color)'
    };

    return (
        <div className={`${styles.message} ${styles[role]}`}>
            <div className={styles.content}>
                {role === 'assistant' ? (
                    <MarkdownRenderer content={content} />
                ) : (
                    <pre className={styles.userPre}>{content}</pre>
                )}
            </div>
            <div className={styles.timestamp}>
                {formatTime(createdAt)}
                {isLastStreaming && (
                    <span className={styles.streamingDot}></span>
                )}
            </div>
            <Tooltip 
                title={copied ? 'Скопировано!' : 'Копировать сообщение'}
                color="var(--bg-secondary)"
                overlayInnerStyle={tooltipOverlayStyle}
            >
                <Button
                    type="text"
                    size="small"
                    className={styles.copyButton}
                    icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                    onClick={handleCopy}
                />
            </Tooltip>
        </div>
    );
    
}