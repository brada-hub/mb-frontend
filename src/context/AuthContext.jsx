import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const login = async (username, password) => {
        try {
            // Platform 'web' validates Role: Director/Admin
            const response = await api.post('/login', { 
                user: username, 
                password, 
                platform: 'web' 
            });
            
            const { token, user: userData, role } = response.data;
            
            localStorage.setItem('token', token);
            setToken(token);
            setUser({ ...userData, role });
            return { success: true };
        } catch (error) {
            console.error(error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Error de conexión' 
            };
        }
    };

    const logout = () => {
        api.post('/logout').finally(() => {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        });
    };

    // Check auth on load
    useEffect(() => {
        if (token) {
            api.get('/profile') // Assuming /profile or standard /user route exists, wait, backend has /profile
                .then(res => {
                    // Profile returns the user with loaded relations
                    setUser(res.data); 
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setToken(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
