describe('Navegación General y Dashboard', () => {
  beforeEach(() => {
    cy.login();
  });

  it('Debe cargar el Dashboard correctamente', () => {
    cy.navigateTo('Dashboard');
    cy.contains('Resumen General').should('exist'); // Ajusta según el texto real de tu dashboard
    // Verificar widgets o tarjetas
    cy.get('.q-card').should('have.length.at.least', 1);
  });

  it('Debe poder navegar entre secciones principales', () => {
    const secciones = ['Eventos', 'Asistencia', 'Repertorio'];

    secciones.forEach(seccion => {
      cy.navigateTo(seccion);
      cy.get('.q-page').should('contain', seccion); // Asume que el título de la página contiene el nombre
    });
  });

  it('Debe cerrar sesión correctamente', () => {
    cy.logout();
    cy.get('input[aria-label="Usuario"]').should('be.visible');
  });
});
