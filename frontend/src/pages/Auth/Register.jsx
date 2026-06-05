import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Input, Button, message, Typography } from 'antd';
import styles from './Auth.module.css';

const { Text } = Typography;

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { register, loading } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await register(username, password);
            message.success('Регистрация успешна! Теперь войдите в аккаунт.');
            navigate('/login');
        } catch (error) {
            message.error(error.error || 'Ошибка регистрации');
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
                        Зарегистрироваться
                    </Button>
                </form>
                <div className={styles.footer}>
                    <Text>Есть аккаунт? </Text>
                    <Link to="/login" className={styles.link}>Войти</Link>
                </div>
            </Card>
        </div>
    );
}