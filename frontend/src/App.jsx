import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Chat from './pages/Chat/Chat';
import AdminPanel from './pages/Admin/AdminPanel';
import { useAuth } from './contexts/AuthContext';

const { Content } = Layout;

function AdminGuard({ children }) {
    const { token, isAdmin } = useAuth();
    if (!token) return <Navigate to="/login" />;
    if (!isAdmin) return <Navigate to="/chat" />;
    return children;
}

export default function App() {
    
    const { token } = useAuth();

    return (
        <Layout style={{ height: '100vh' }}>
            <Content>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/chat" element={token ? <Chat /> : <Navigate to="/login" />} />
                    <Route path="/admin/*" element={
                        <AdminGuard>
                            <AdminPanel />
                        </AdminGuard>
                    } />
                    <Route path="/" element={<Navigate to="/chat" replace />} />
                </Routes>
            </Content>
        </Layout>
    );
}