import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Router from './router';
import { Capacitor } from '@capacitor/core';

function App() {
  // Inicialización de la app nativa
  useEffect(() => {
    const initNativeApp = async () => {
      // Solo ejecutar en plataformas nativas (Android/iOS)
      if (Capacitor.isNativePlatform()) {
        try {
          // Importar dinámicamente para evitar errores en web
          const statusBarModule = await import('@capacitor/status-bar');
          const splashModule = await import('@capacitor/splash-screen');
          
          const StatusBar = statusBarModule.StatusBar;
          const SplashScreen = splashModule.SplashScreen;
          
          // Configurar StatusBar
          await StatusBar.setStyle({ style: 'DARK' });
          await StatusBar.setBackgroundColor({ color: '#0f111a' });
          
          // Ocultar SplashScreen después de 2 segundos
          setTimeout(async () => {
            await SplashScreen.hide();
          }, 2000);
          
          console.log('App nativa inicializada correctamente');
        } catch (error) {
          console.log('Plugins nativos no disponibles:', error.message);
        }
      }
    };
    
    initNativeApp();
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

