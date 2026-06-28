import { useState } from 'react';
import { Tabs, Button, Typography, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { 
    UserOutlined, 
    BarChartOutlined, 
    LogoutOutlined,
    MoonOutlined,
    SunOutlined
} from '@ant-design/icons';
import UsersTab from './UsersTab';
import StatsTab from './StatsTab';
import styles from './AdminPanel.module.css';

const { Title } = Typography;

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('users');
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const items = [
        {
            key: 'users',
            label: (
                <span>
                    <UserOutlined />
                    Пользователи
                </span>
            ),
            children: <UsersTab />
        },
        {
            key: 'stats',
            label: (
                <span>
                    <BarChartOutlined />
                    Статистика
                </span>
            ),
            children: <StatsTab />
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Title level={3} className={styles.title}>Админ панель</Title>
                    <span className={styles.subtitle}>{user?.username}</span>
                </div>
                <div className={styles.headerRight}>
                    <Button 
                        type="text" 
                        icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />} 
                        onClick={toggleTheme}
                    />
                    <Popconfirm
                            title="Выйти из аккаунта?"
                            onConfirm={handleLogout}
                            okText="Да"
                            cancelText="Нет"
                        >
                            <Button type="text" icon={<LogoutOutlined />} />
                    </Popconfirm>
                </div>
            </div>
            <div className={styles.content}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items}
                    className={styles.tabs}
                    type="card"
                />
            </div>
        </div>
    );
}