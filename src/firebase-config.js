import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Configuración de Firebase del usuario
const firebaseConfig = {
  apiKey: "AIzaSyAcJaTI_9ts4VPcLbtIb7pBRFaqiYgSCRo",
  authDomain: "monster-band.firebaseapp.com",
  projectId: "monster-band",
  storageBucket: "monster-band.firebasestorage.app",
  messagingSenderId: "185446108898",
  appId: "1:185446108898:web:13218f28cd1d476db358bb",
  measurementId: "G-JVBY3FDDE6"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Clave pública VAPID (la obtienes en Firebase Console > Configuración del proyecto > Cloud Messaging)
export const VAPID_KEY = "BCGv8FDOgIzcZAwgOhB3sFOm21vlo3IfXMPXXb63nhHoNIA1K9kImFJqf80v5TRznqAmv3iQswu14RFTAVx2TnE";

export const requestForToken = async () => {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    // Si ya está denegado, no insistir ni loguear error ruidoso
    if (Notification.permission === 'denied') {
      return null;
    }

    // Solo intentar si es default o granted
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      const currentToken = await getToken(messaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (currentToken) {
        return currentToken;
      }
    }
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'NotAllowedError') {
      // Silencioso para errores esperados en desarrollo/bloqueo
    } else {
      console.warn('FCM registration skipped:', err.message);
    }
  }
  return null;
};
