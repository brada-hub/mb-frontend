import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';

export const isNative = () => {
  return Capacitor.isNativePlatform();
};

export const setupNativeNotifications = async (onTokenReceived) => {
  if (!isNative()) return;

  // Solicitar permisos
  let permStatus = await PushNotifications.checkPermissions();
  
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    throw new Error('User denied permissions!');
  }

  // Registrar para recibir notificaciones
  await PushNotifications.register();

  // Listeners
  PushNotifications.addListener('registration', (token) => {
    console.log('Push registration success, token: ' + token.value);
    if (onTokenReceived) onTokenReceived(token.value);
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Error on registration: ' + JSON.stringify(error));
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received: ' + JSON.stringify(notification));
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push action performed: ' + JSON.stringify(notification));
  });
};

export const getCurrentPosition = async () => {
    if (isNative()) {
        const coordinates = await Geolocation.getCurrentPosition();
        return coordinates;
    } else {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }
};

export const getDeviceInfo = async () => {
    return await Device.getInfo();
};
