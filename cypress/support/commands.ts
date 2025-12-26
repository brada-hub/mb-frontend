// ***********************************************
// Comandos Personalizados de Cypress
// Para Monster Band
// ***********************************************

/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Iniciar sesión en la aplicación
       * @param username - Nombre de usuario
       * @param password - Contraseña
       */
      login(username?: string, password?: string): Chainable<void>;

      /**
       * Cerrar sesión
       */
      logout(): Chainable<void>;

      /**
       * Obtener un elemento por su data-cy attribute
       * @param selector - Valor del atributo data-cy
       */
      getByCy(selector: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Esperar a que la API esté lista
       */
      waitForApi(): Chainable<void>;

      /**
       * Navegar a una sección del menú
       */
      navigateTo(menuItem: string): Chainable<void>;

      /**
       * Llenar un campo de formulario Quasar
       */
      fillQuasarInput(label: string, value: string): Chainable<void>;

      /**
       * Seleccionar opción en q-select
       */
      selectQuasarOption(label: string, option: string): Chainable<void>;
    }
  }
}

// ═══════════════════════════════════════════════════════════
// COMANDO: Login
// ═══════════════════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-unused-vars
Cypress.Commands.add('login', (username?: string, password?: string) => {
  const user = username || Cypress.env('adminUser');
  const pass = password || Cypress.env('adminPassword');

  // Visitar la raíz primero para limpiar estados
  cy.visit('/');

  // Si ya estamos logueados (vemos el drawer), no hacer nada
  cy.get('body').then(($body) => {
    if ($body.find('.q-drawer').length > 0) {
      return;
    }

    // Si no, hacer login
    cy.visit('/#/login'); // Asegurar modo hash explícito
    cy.get('input[aria-label="Usuario"]').should('be.visible').clear().type(user);
    cy.get('input[aria-label="Contraseña"]').should('be.visible').clear().type(pass);
    cy.get('button[type="submit"]').click();

    // Validar éxito esperando elementos del dashboard, no solo URL
    // Esperamos a que la barra lateral aparezca, señal inequívoca de login exitoso
    cy.get('.q-drawer', { timeout: 15000 }).should('be.visible');
  });
});

// ═══════════════════════════════════════════════════════════
// COMANDO: Logout
// ═══════════════════════════════════════════════════════════
Cypress.Commands.add('logout', () => {
  // Abrir menú de usuario y cerrar sesión
  cy.get('.q-avatar').last().click();
  cy.contains('Cerrar Sesión').click();
  cy.url().should('include', '/login');
});

// ═══════════════════════════════════════════════════════════
// COMANDO: Obtener por data-cy
// ═══════════════════════════════════════════════════════════
Cypress.Commands.add('getByCy', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});

// ═══════════════════════════════════════════════════════════
// COMANDO: Esperar API
// ═══════════════════════════════════════════════════════════
Cypress.Commands.add('waitForApi', () => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/health`,
    failOnStatusCode: false,
  }).should((response) => {
    expect(response.status).to.eq(200);
  });
});

// ═══════════════════════════════════════════════════════════
// COMANDO: Navegar a sección del menú
// ═══════════════════════════════════════════════════════════
Cypress.Commands.add('navigateTo', (menuItem: string) => {
  // Asegurar que el drawer esté visible
  cy.get('.q-drawer').should('be.visible');
  cy.contains('.q-item', menuItem).click();
  cy.wait(500); // Esperar transición
});

// ═══════════════════════════════════════════════════════════
// COMANDO: Llenar input de Quasar
// ═══════════════════════════════════════════════════════════
Cypress.Commands.add('fillQuasarInput', (label: string, value: string) => {
  cy.contains('.q-field', label)
    .find('input, textarea')
    .clear()
    .type(value, { delay: 50 });
});

// ═══════════════════════════════════════════════════════════
// COMANDO: Seleccionar opción en q-select
// ═══════════════════════════════════════════════════════════
Cypress.Commands.add('selectQuasarOption', (label: string, option: string) => {
  // Encontrar el campo y asegurar que es visible y scrollear a él
  cy.contains('.q-field', label)
    .scrollIntoView()
    .should('be.visible')
    .click();

  // Esperar explícitamente a que el menú aparezca con animación
  // Quasar pone el menú en el portal 'body', no dentro del select
  cy.get('.q-menu', { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .then(($menu) => {
      // Dentro del menú visible, buscar la opción
      cy.wrap($menu)
        .contains('.q-item', option)
        .scrollIntoView()
        .should('be.visible')
        .click();
    });

  // Esperar a que el menú desaparezca para no tapar otros elementos
  cy.get('.q-menu').should('not.exist');
});

export {};
