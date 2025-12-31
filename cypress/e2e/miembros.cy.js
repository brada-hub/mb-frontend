describe('Módulo de Miembros - Monster Band', () => {
    beforeEach(() => {
      // 1. Limpiar el miembro de prueba de la BD antes de empezar para que no se acumulen
      // (Enviamos una petición al endpoint secreto de limpieza)
      cy.request('POST', 'http://localhost:8000/api/cleanup-test-member').then((response) => {
        cy.log('Resultado limpieza:', response.body.message);
      });

      // 2. Iniciar sesión
      cy.visit('/');
      cy.get('input[name="user"]').type('admin');
      cy.get('input[name="password"]').type('monster2025');
      cy.get('button[type="submit"]').click();
      
      // 3. Navegar a Miembros
      cy.url().should('include', '/dashboard');
      cy.contains('Miembros').click();
    });
  
    it('Debe realizar búsquedas por sección, categoría, nombre, CI y celular', () => {
      // 1. Búsqueda por Sección
      cy.get('#filter-section').select('Trompetas'); 
      cy.wait(500);
      
      // 2. Búsqueda por Categoría
      cy.get('#filter-category').select('A'); 
      cy.wait(500);
  
      // 3. Búsqueda por Nombre
      cy.get('#search-input').clear().type('Admin');
      cy.wait(500);
      cy.get('.grid').should('contain', 'Admin');
  
      // 4. Búsqueda por CI
      cy.get('#search-input').clear().type('7000000');
      cy.wait(500);
      cy.get('.grid').should('contain', '7000000');
  
      // 5. Búsqueda por Celular
      cy.get('#search-input').clear().type('70000000');
      cy.wait(500);
      cy.get('.grid').should('contain', '70000000');
    });
  
    it('Debe crear un nuevo miembro con todos los campos y contacto de emergencia', () => {
      // Usaremos un CI y Teléfono fijos ahora que limpiamos la BD antes
      const testCI = '11223344';
      const testPhone = '77889900';

      cy.get('#btn-nuevo').click();
  
      // Llenar Datos Personales
      cy.get('input[name="nombres"]').type('CYPRESS');
      cy.get('input[name="apellidos"]').type('INTEGRATION TEST');
      cy.get('input[name="ci"]').type(testCI);
      cy.get('input[name="celular"]').type(testPhone);
      cy.get('input[name="fecha"]').type('1995-05-15');
  
      // Ubicación en el mapa (Cochabamba)
      cy.get('.leaflet-container').click(200, 200); 
      
      cy.get('textarea[name="direccion"]').type('SOPORTE TECNICO CYPRESS, CALLE VIRTUAL 404');
  
      // Asignación Operativa
      cy.get('#select-seccion').select('Trompetas'); 
      cy.get('#select-categoria').select('A');
      cy.get('#select-rol').select('Músico'); 
  
      // Contacto de Emergencia
      cy.get('#check-emergency').click({ force: true });
      cy.get('input[name="contacto_nombre"]').type('SOPORTE MONSTER');
      cy.get('input[name="contacto_celular"]').type('65432100');
      cy.get('input[name="contacto_parentesco"]').type('HERMANO');
  
      // Enviar formulario
      cy.get('#btn-submit-miembro').click();
  
      // Verificar que se creó (Aparece el modal de credenciales)
      cy.contains('¡Bienvenido a la Banda!', { timeout: 10000 }).should('be.visible');
      
      // Cerrar y verificar en la lista
      cy.contains('Finalizar Registro').click();
      cy.get('#search-input').clear().type('CYPRESS INTEGRATION');
      cy.get('.grid').should('contain', 'CYPRESS INTEGRATION');
      cy.get('.grid').should('contain', 'Con Acceso');
    });
  });
