describe('Gestión de Miembros', () => {
  beforeEach(() => {
    // Login y espera explícita del dashboard
    cy.login();

    // Navegar explícitamente usando la URL hash
    cy.visit('/#/miembros');

    // Esperar a que el loader desaparezca si existe
    cy.get('.q-spinner').should('not.exist');
    // Verificar que estamos en la página correcta
    cy.contains('h1', 'Miembros').should('be.visible');
  });

  it('Debe cargar la lista de miembros correctamente y mostrar el grid responsive', () => {
    cy.get('.mb-grid').should('exist');
    cy.get('.mb-col').should('have.length.at.least', 0);
  });

  it('Debe validar restricciones estrictas en el Modal de Nuevo Miembro', () => {
    // Abrir Modal
    cy.contains('button', 'Nuevo Miembro').should('be.visible').click();
    cy.get('.q-dialog').should('be.visible');

    cy.get('.q-dialog').within(() => {
      // 1. Limite de 30 caracteres en Nombres
      const nombreLargo = 'EsteNombreEsDemasiadoLargoParaElSistemaYDebeTruncarse';
      cy.contains('.q-field', 'Nombres *').find('input').type(nombreLargo);
      cy.contains('.q-field', 'Nombres *').find('input').should('have.value', nombreLargo.substring(0, 30));

      // 2. Validación estricta de CI (mínimo, guión para letras, máximo 12)
      // Caso 1: Intentar poner letra sin guión (debe ser bloqueado por regex o validación)
      cy.contains('.q-field', 'CI *').find('input').clear().type('12345A');
      cy.get('.q-field__bottom').should('contain', 'Formato inválido');

      // Caso 2: Guión y letras (válido)
      cy.contains('.q-field', 'CI *').find('input').clear().type('1234567-A');
      cy.get('.q-field--error').should('not.exist');

      // Caso 3: Límite 12 caracteres
      cy.contains('.q-field', 'CI *').find('input').clear().type('123456789012345');
      cy.contains('.q-field', 'CI *').find('input').should('have.value', '123456789012');

      // 3. Celular: Debe empezar con 6 o 7
      // Intentar empezar con 4 (debe limpiarse según la lógica filtrarCelular)
      cy.contains('.q-field', 'Celular *').find('input').clear().type('4');
      cy.contains('.q-field', 'Celular *').find('input').should('have.value', '');

      // Empezar con 7
      cy.contains('.q-field', 'Celular *').find('input').type('70001234');
      cy.contains('.q-field', 'Celular *').find('input').should('have.value', '70001234');
    });

    // Cerrar modal
    cy.contains('button', 'Cancelar').click();
  });

  it('Debe crear un nuevo miembro exitosamente con el flujo de 3 pasos', () => {
    cy.contains('button', 'Nuevo Miembro').click();
    cy.get('.q-dialog').should('be.visible');

    const randomId = Math.floor(Math.random() * 10000);
    const ci = `88${randomId}-X`;

    cy.get('.q-dialog').within(() => {
      // Sección 1: Datos y Ubicación (Ahora están juntos arriba)
      cy.contains('.q-field', 'Nombres *').find('input').type('Cypress');
      cy.contains('.q-field', 'Apellidos *').find('input').type('Test');
      cy.contains('.q-field', 'CI *').find('input').type(ci);
      cy.contains('.q-field', 'Celular *').find('input').type('60000000');
      cy.contains('.q-field', 'Fecha Nacimiento *').find('input').type('2000-01-01');
      cy.contains('.q-field', 'Dirección Detallada').find('textarea').type('Calle Falsa 123');

      // Sección 2: Contacto de Emergencia
      cy.contains('.q-field', 'Nombre de Contacto').find('input').type('Contacto Ref');
      cy.contains('.q-field', 'Celular de Contacto').find('input').type('70001122');
    });

    // Sección 3: Info Banda (Selects) - Fuera del dentro por el .q-menu
    const seleccionarOpcion = (label: string) => {
      cy.get('.q-dialog').contains('.q-field', label).click();
      cy.wait(400);
      cy.get('.q-menu').should('be.visible').find('.q-item').first().click({ force: true });
      cy.wait(200);
    };

    seleccionarOpcion('Sección *');
    seleccionarOpcion('Categoría *');
    seleccionarOpcion('Rol *');

    // Guardar
    cy.get('.q-dialog').contains('button', 'Guardar').click();

    // Pantalla de Credenciales
    cy.contains('¡Miembro Registrado!', { timeout: 10000 }).should('be.visible');
    cy.contains('button', 'Finalizar').click();

    cy.get('.q-dialog').should('not.exist');
  });
});
