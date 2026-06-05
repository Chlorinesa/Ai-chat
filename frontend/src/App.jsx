import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Chat from './pages/Chat/Chat';
import { useAuth } from './contexts/AuthContext';

const { Content } = Layout;

export default function App() {
    
    const { token } = useAuth();

    return (
        <Layout style={{ height: '100vh' }}>
            <Content>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/chat" element={token ? <Chat /> : <Navigate to="/login" />} />
                    <Route path="/" element={<Navigate to="/chat" replace />} />
                </Routes>
            </Content>
        </Layout>
    );
}