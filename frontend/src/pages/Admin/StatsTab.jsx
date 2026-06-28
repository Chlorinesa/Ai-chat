import { useState, useEffect } from 'react';
import { Card, Statistic, Spin, message } from 'antd';
import { UserOutlined, MessageOutlined, CommentOutlined, RiseOutlined } from '@ant-design/icons';
import { apiGetStats } from '../../api/admin';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,BarChart, Bar} from 'recharts';
import styles from './AdminPanel.module.css';

export default function StatsTab() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await apiGetStats();
            if (response?.data) {
                setStats(response.data);
            }
        } catch (error) {
            message.error('Ошибка загрузки статистики');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.empty}>
                <Spin size="large" tip="Загрузка статистики..." />
            </div>
        );
    }

    if (!stats) return null;

    const messagesByDay = stats.messages_by_day.map(item => ({
        date: new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        count: parseInt(item.count)
    }));

    const topUsers = stats.top_users.map(item => ({
        name: item.username,
        messages: parseInt(item.count)
    }));

    const statCards = [
        {
            title: 'Всего пользователей',
            value: stats.total_users,
            icon: <UserOutlined />,
            color: '#72645e'
        },
        {
            title: 'Всего чатов',
            value: stats.total_chats,
            icon: <CommentOutlined />,
            color: '#4a1cae'
        },
        {
            title: 'Всего сообщений',
            value: stats.total_messages,
            icon: <MessageOutlined />,
            color: '#52c41a'
        },
        {
            title: 'Сообщений сегодня',
            value: stats.messages_today,
            icon: <RiseOutlined />,
            color: '#faad14'
        }
    ];

    return (
        <div className={styles.tabContent}>
            <div className={styles.statsGrid}>
                {statCards.map((card, idx) => (
                    <Card key={idx} className={styles.statCard} bordered={false}>
                        <Statistic
                            title={card.title}
                            value={card.value}
                            prefix={
                                <span style={{ color: card.color, marginRight: 8 }}>
                                    {card.icon}
                                </span>
                            }
                            valueStyle={{ color: 'var(--text-color)', fontWeight: 600 }}
                        />
                    </Card>
                ))}
            </div>

            <div className={styles.chartsGrid}>
                <Card 
                    title="Сообщений по дням (последние 30 дней)" 
                    className={styles.chartCard}
                    bordered={false}
                >
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={messagesByDay}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis 
                                dataKey="date" 
                                stroke="var(--text-secondary)"
                                fontSize={11}
                                tickMargin={8}
                            />
                            <YAxis 
                                stroke="var(--text-secondary)"
                                fontSize={11}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 8,
                                    color: 'var(--text-color)'
                                }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#72645e" 
                                strokeWidth={2}
                                dot={{ fill: '#72645e', r: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                <Card 
                    title="Топ-5 пользователей по сообщениям" 
                    className={styles.chartCard}
                    bordered={false}
                >
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={topUsers}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis 
                                dataKey="name" 
                                stroke="var(--text-secondary)"
                                fontSize={11}
                                tickMargin={8}
                            />
                            <YAxis 
                                stroke="var(--text-secondary)"
                                fontSize={11}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 8,
                                    color: 'var(--text-color)'
                                }}
                            />
                            <Bar dataKey="messages" fill="#72645e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
}