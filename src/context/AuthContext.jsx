import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(!!token);

    const login = async (username, password) => {
        setLoading(true); // Set loading before starting login process
        try {
            const response = await api.post('/login', { 
                user: username, 
                password, 
                platform: 'web' 
            });
            
            const { token: newToken, user: userData, role, permissions, password_changed, profile_completed, is_super_admin } = response.data;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser({ ...userData, role, permissions, password_changed, profile_completed, is_super_admin });
            setLoading(false); // Success
            return { success: true };
        } catch (error) {
            console.error(error);
            setLoading(false); // Fail
            return { 
                success: false, 
                message: error.response?.data?.message || 'Error de conexión' 
            };
        }
    };

    const logout = () => {
        setLoading(true); // Show loader during logout if needed
        api.post('/logout').finally(() => {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setLoading(false);
        });
    };

    // Check auth on load
    useEffect(() => {
        let isMounted = true;

        if (token && !user) {
            api.get('/profile') 
                .then(res => {
                    if (isMounted) {
                        const { user: userData, role, permissions, password_changed, profile_completed } = res.data;
                        setUser({ ...userData, role, permissions, password_changed, profile_completed });
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                    }
                })
                .finally(() => {
                    if (isMounted) setLoading(false);
                });
        } else {
            // Si entra aquí y loading sigue en true, lo apagamos de forma asíncrona
            // para evitar el error de "cascading renders" de ESLint.
            if (loading) {
                queueMicrotask(() => {
                    if (isMounted) setLoading(false);
                });
            }
        }

        return () => { isMounted = false; };
    }, [token, user, loading]);

    // Aplicar branding de la banda dinámicamente
    useEffect(() => {
        if (user?.banda) {
            const root = document.documentElement;
            const { color_primario, color_secundario } = user.banda;
            
            if (color_primario) root.style.setProperty('--brand-primary', color_primario);
            if (color_secundario) root.style.setProperty('--brand-secondary', color_secundario);
            
            document.title = `${user.banda.nombre} - MB APP`;
        }
    }, [user]);

    const updateUser = (data) => {
        setUser(prev => prev ? { ...prev, ...data } : null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
