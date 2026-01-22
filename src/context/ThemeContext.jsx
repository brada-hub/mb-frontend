import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    
    // 1. Initial State from LocalStorage or System or User (though User is not available instantly on first render usually)
    const [theme, setTheme] = useState(() => {
        if (localStorage.getItem('theme')) return localStorage.getItem('theme');
        return 'system';
    });

    // 2. Sync with User Preference when User loads
    useEffect(() => {
        if (user && user.theme_preference) {
            setTheme(user.theme_preference);
            localStorage.setItem('theme', user.theme_preference); // Sync local
        }
    }, [user]);

    // 3. Apply Theme to DOM
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    // 4. Update Function
    const updateTheme = async (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Persist to Backend if logged in
        if (user) {
            try {
                await api.post('/update-theme', { theme: newTheme });
            } catch (error) {
                console.error('Failed to sync theme preference', error);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
