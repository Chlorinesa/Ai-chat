import { Button, Input, Avatar, Typography, List, Spin, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, LogoutOutlined, UserOutlined, MoonOutlined, SunOutlined, DeleteOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { useSearch } from '../../hooks/useSearch';
import logo from '../../assets/Logo.jpg';  
import styles from './ChatSidebar.module.css';

const { Text, Title } = Typography;

export default function ChatSidebar({
    collapsed, onCollapse, loadingChats, chats, activeChatId,
    onSelectChat, onCreateChat, onDeleteChat
}) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { query, setQuery, results, loading: searchLoading } = useSearch();

    const displayChats = query.trim() === '' ? chats : results;

    return (
        <div className={`${styles.container} ${styles.sider}`}>

            <div className={styles.siderHeader}>
                {!collapsed && (
                    <div className={styles.logoWrapper}>
                        
                        <span 
                            className={styles.logo}
                            style={{ '--logo-url': `url(${logo})` }}
                        >
                            <Title level={3}>Чаты</Title>
                        </span>
                    </div>
                )}
                <Button 
                    type="text" 
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
                    onClick={onCollapse} 
                />
            </div>

            <div className={styles.createChatBtn}>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={onCreateChat} 
                    block={!collapsed}
                >
                    {!collapsed && 'Новый чат'}
                </Button>
            </div>

            {!collapsed && (
                <div className={styles.searchContainer}>
                    <Input 
                        placeholder="Поиск" 
                        prefix={<SearchOutlined />}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        allowClear
                    />
                </div>
            )}

            {!collapsed && (
                <div className={styles.chatList}>
                    {(searchLoading || loadingChats )
                    ? 
                        <div className={styles.empty}>
                            <Spin size="large" tip="Загрузка чатов..." />
                        </div>
                    : (
                        <List
                            dataSource={displayChats}
                            renderItem={chat => (
                                <div
                                    key={chat.id}
                                    className={`${styles.chatItem} ${chat.id === activeChatId ? styles.active : ''}`}
                                    onClick={() => onSelectChat(chat.id)}
                                >
                                    <Text className={styles.chatTitle}>{chat.title}</Text>
                                    <Popconfirm
                                        title="Удалить чат?"
                                        onConfirm={() => onDeleteChat(chat.id)}
                                        okText="Да"
                                        cancelText="Нет"
                                    >
                                        <DeleteOutlined className={styles.deleteBtn} onClick={(e) => e.stopPropagation()} />
                                    </Popconfirm>
                                </div>
                            )}
                        />
                    )}
                </div>
            )}

            {!collapsed && (
                <div className={styles.userPanel}>
                    <Avatar icon={<UserOutlined />} />
                    <span className={styles.username}>{user?.username || 'User'}</span>
                    <div className={styles.userActions}>
                        <Button 
                            type="text" 
                            icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />} 
                            onClick={toggleTheme}
                        />
                        <Popconfirm
                            title="Выйти из аккаунта?"
                            onConfirm={logout}
                            okText="Да"
                            cancelText="Нет"
                        >
                            <Button type="text" icon={<LogoutOutlined />} />
                        </Popconfirm>
                    </div>
                </div>
            )}
        </div>
    );
}