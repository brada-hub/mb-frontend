import { useEffect } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Router from './router';
import { Capacitor } from '@capacitor/core';

// Componente interno que maneja el botón atrás
function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const setupBackButton = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const { App } = await import('@capacitor/app');
          
          // Listener para el botón atrás de Android
          App.addListener('backButton', ({ canGoBack }) => {
            // Si estamos en login o dashboard, minimizar app
            if (location.pathname === '/login' || location.pathname === '/dashboard') {
              App.minimizeApp();
            } else if (canGoBack || window.history.length > 1) {
              // Ir atrás en el historial
              navigate(-1);
            } else {
              // Minimizar si no hay historial
              App.minimizeApp();
            }
          });
          
          console.log('Back button handler configurado');
        } catch (error) {
          console.log('Error configurando back button:', error.message);
        }
      }
    };

    setupBackButton();

    // Cleanup
    return () => {
      if (Capacitor.isNativePlatform()) {
        import('@capacitor/app').then(({ App }) => {
          App.removeAllListeners();
        }).catch(() => {});
      }
    };
  }, [navigate, location]);

  return null;
}

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
          
          // Configurar StatusBar - Superponer para look inmersivo premium
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.setStyle({ style: 'DARK' });
          // Color transparente o que combine con el header
          await StatusBar.setBackgroundColor({ color: '#000000' });
          
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
            <BackButtonHandler />
            <Router />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;


