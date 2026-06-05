import { createContext, useState, useContext } from "react";
import { apiLogin, apiRegister } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
    const [loading, setLoading] = useState(false);

    const login = async (username, password) => {
        setLoading(true);
        try {
            const response = await apiLogin(username, password);
            if (response.token) {
                setToken(response.token);
                localStorage.setItem('token', response.token);
                const userData = { username };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            }
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, password) => {
        setLoading(true);
        try {
            const response = await apiRegister(username, password);
            return response;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activeChatId')
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};