// ***********************************************************
// Cypress E2E Support File
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands';

// Manejar excepciones no capturadas de la aplicación
Cypress.on('uncaught:exception', (err) => {
  // Ignorar errores de hidratación de Vue y otros errores comunes
  if (
    err.message.includes('Hydration') ||
    err.message.includes('ResizeObserver') ||
    err.message.includes('Network Error')
  ) {
    return false;
  }
  return true;
});

// Limpiar localStorage antes de cada prueba
beforeEach(() => {
  // Opcional: limpiar estado entre pruebas
  // cy.clearLocalStorage();
});
