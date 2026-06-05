import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Input, Button, message, Typography } from 'antd';
import styles from './Auth.module.css';

const { Text } = Typography;

export default function Login() {
    
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await login(username, password);
            if (response?.token) {
                message.success('Добро пожаловать!');
                navigate('/chat');
            }
        } catch (error) {
            message.error(error.error || 'Ошибка входа');
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input 
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input.Password
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Войти
                    </Button>
                </form>
                <div className={styles.footer}>
                    <Text>Нет аккаунта? </Text>
                    <Link to="/register" className={styles.link}>Зарегистрироваться</Link>
                </div>
            </Card>
        </div>
    );
}