import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { isNative, getDeviceInfo, getDeviceId } from '../utils/nativeApp';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(!!token);

    const login = async (username, password, band_slug = null) => {
        setLoading(true); // Set loading before starting login process
        try {
            // Obtener info del dispositivo si es nativo
            let deviceInfo = {};
            if (isNative()) {
                try {
                    const info = await getDeviceInfo();
                    const idRes = await getDeviceId();
                    deviceInfo = {
                        uuid_celular: idRes.identifier || idRes.uuid || idRes.id,
                        device_model: `${info.manufacturer || ''} ${info.model || 'Dispositivo'}`.trim()
                    };
                } catch (e) {
                    console.log('No se pudo obtener info del dispositivo:', e);
                }
            }

            const response = await api.post('/login', { 
                user: username, 
                password, 
                platform: isNative() ? 'android' : 'web',
                band_slug, // Enviamos el slug si estamos en un login personalizado
                ...deviceInfo // uuid_celular y device_model si es nativo
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
        // PRIMERO limpiar estado local para evitar peticiones race-condition
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        
        // Luego notificar al servidor (fire and forget)
        api.post('/logout').catch(() => {});
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

    // Inicializar Notificaciones Push si estamos en móvil
    useEffect(() => {
        if (token && user && isNative()) {
            const initPush = async () => {
                try {
                    const { setupNativeNotifications } = await import('../utils/nativeApp');
                    await setupNativeNotifications(async (fcmToken) => {
                        console.log('FCM Token recibido:', fcmToken);
                        try {
                            await api.post('/update-fcm-token', { fcm_token: fcmToken });
                            console.log('Token FCM actualizado en el servidor');
                        } catch (err) {
                            console.error('Error al actualizar token FCM en el servidor:', err);
                        }
                    });
                } catch (err) {
                    console.error('Error inicializando notificaciones push:', err);
                }
            };
            initPush();
        }
    }, [token, user]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
