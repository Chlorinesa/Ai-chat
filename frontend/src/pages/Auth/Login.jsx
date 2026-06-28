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
                
                // Редирект в зависимости от роли
                const userRole = response.user?.role;
                if (userRole === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/chat');
                }
            }
        } catch (error) {
            message.error(error.error || 'Ошибка входа');
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    
                    <span
                        style={{marginBottom:10, color: '#3f3f3f'}}
                    >
                        Вход в систему
                    </span>
                    <Input 
                        placeholder="Имя пользователя"
                        value={username}
                        style={{height:40}}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input.Password
                        placeholder="Пароль"
                        value={password}
                        spellCheck={false}
                        autoCapitalize="on"
                        autoCorrect="off"
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