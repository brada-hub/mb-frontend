import { useQuasar } from 'quasar';

export function useMonsterNotify() {
  const $q = useQuasar();

  const notifySuccess = (message: string) => {
    $q.notify({
      type: 'positive',
      message,
      icon: 'check_circle',
      position: 'top-right',
      timeout: 3000,
      actions: [{ icon: 'close', color: 'white', round: true, handler: () => { /* cerrar */ } }]
    });
  };

  const notifyError = (message: string) => {
    $q.notify({
      type: 'negative',
      message: message || 'Ocurrió un error inesperado',
      icon: 'error',
      position: 'top-right',
      timeout: 4000,
      actions: [{ icon: 'close', color: 'white', round: true, handler: () => { /* cerrar */ } }]
    });
  };

  const notifyInfo = (message: string) => {
    $q.notify({
      type: 'info',
      message,
      icon: 'info',
      position: 'top-right',
      timeout: 3000
    });
  };

  const notifyWarning = (message: string) => {
    $q.notify({
      type: 'warning',
      message,
      icon: 'warning',
      position: 'top-right',
      textColor: 'dark',
      timeout: 4000
    });
  };

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning
  };
}
