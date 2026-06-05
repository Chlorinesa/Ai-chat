import { Layout } from 'antd';
import ChatSidebar from '../ChatSidebar/ChatSidebar';
import ChatContent from '../ChatContent/ChatContent';
import styles from './ChatLayout.module.css';

const { Sider, Content } = Layout;

export default function ChatLayout({
    collapsed, onCollapse,
    loadingChats, chats, activeChatId, onSelectChat, onCreateChat, onDeleteChat,
    loadingMessages, messages, onSendMessage, onStop, isStreaming, isTyping, 
    sendingMessages, activeChatTitle
}) {
    return (
        <Layout className={styles.container}>
            <Sider
                className={styles.sider}
                width={300}
                collapsedWidth={60}
                collapsed={collapsed}
                onCollapse={onCollapse}
                trigger={null}
            >
                <ChatSidebar
                    collapsed={collapsed}
                    onCollapse={onCollapse}
                    loadingChats={loadingChats}
                    chats={chats}
                    activeChatId={activeChatId}
                    onSelectChat={onSelectChat}
                    onCreateChat={onCreateChat}
                    onDeleteChat={onDeleteChat}
                />
            </Sider>
            <Layout>
                <Content className={styles.content}>
                    <ChatContent
                        activeChatId={activeChatId}
                        loadingMessages={loadingMessages}
                        messages={messages}
                        onSendMessage={onSendMessage}
                        onStop={onStop}                 
                        isStreaming={isStreaming}  
                        isTyping={isTyping}     
                        sendingMessages={sendingMessages}
                        title={activeChatTitle}
                    />
                </Content>
            </Layout>
        </Layout>
    );
}