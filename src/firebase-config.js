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
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        console.log('Token FCM:', currentToken);
        return currentToken;
      } else {
        console.log('No se pudo obtener el token. Asegúrate de que el Service Worker esté configurado.');
      }
    }
  } catch (err) {
    console.error('Error al obtener el token Push:', err);
  }
  return null;
};
