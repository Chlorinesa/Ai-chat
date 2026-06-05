import { useRef, useEffect } from 'react';
import Message from '../Message/Message';
import { formatDateDivider, isDifferentDay } from '../../utils/date';
import styles from './MessageList.module.css';

export default function MessageList({ messages, loading, isTyping }) {
    
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const groupedMessages = [];
    let lastDate = null;

    messages.forEach((msg) => {
        const currentDate = msg.created_at;
        if (!lastDate || isDifferentDay(lastDate, currentDate)) {
            groupedMessages.push({ type: 'date', date: currentDate });
            lastDate = currentDate;
        }
        groupedMessages.push({ type: 'message', ...msg });
    });

    return (
        <div className={styles.container}>

            {groupedMessages.map((item, idx) => {
                if (item.type === 'date') {
                    return (
                        <div key={`date-${idx}`} className={styles.dateDivider}>
                            <span className={styles.dateText}>{formatDateDivider(item.date)}</span>
                        </div>
                    );
                }
                return (
                    <Message
                        key={item.id}
                        role={item.role}
                        content={item.content}
                        createdAt={item.created_at}
                    />
                );
            })}

            {isTyping && (
                <div className={styles.typingIndicator}>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                </div>
            )}
            
            <div ref={bottomRef} />
        </div>
    );
}