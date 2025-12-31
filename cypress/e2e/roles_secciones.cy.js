describe('Módulo de Roles y Secciones - Monster Band', () => {
    
    beforeEach(() => {
        // Limpiar datos de prueba anteriores
        cy.request('POST', 'http://localhost:8000/api/cleanup-test-data').then((response) => {
            cy.log('Limpieza de datos:', response.body.message);
        });

        // Iniciar sesión como administrador
        cy.visit('/');
        cy.get('input[name="user"]').clear().type('admin.monster@mb');
        cy.get('input[name="password"]').clear().type('monster2026');
        cy.get('button[type="submit"]').click();
        
        // Esperar a que cargue el dashboard
        cy.url().should('include', '/dashboard');
    });

    it('Debe gestionar el ciclo de vida de una SECCIÓN (Crear, Editar, Eliminar)', () => {
        // Generar sufijo aleatorio SOLO DE LETRAS porque el input no permite números
        const generateRandomLetters = (length) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };
        
        const suffix = generateRandomLetters(5);
        const sectionName = `SECCION CYPRESS ${suffix}`;
        const sectionNameEdited = `SECCION CYPRESS EDITADA ${suffix}`;

        // 1. Ir a Secciones
        cy.contains('Secciones').click();
        cy.contains('Secciones de la Banda').should('be.visible');

        // 2. Crear Sección
        cy.contains('Nueva Sección').click();
        cy.get('input[name="seccion"]').type(sectionName);
        cy.get('textarea[name="descripcion"]').type('Prueba automatizada de sección');
        cy.contains('Crear Sección').click();

        // 3. Verificar creación
        cy.contains(sectionName).should('be.visible');

        // 4. Editar Sección
        cy.contains(sectionName)
            .parents('.group')
            .find('button')
            .contains('EDITAR')
            .click({ force: true });
        
        cy.get('input[name="seccion"]').clear().type(sectionNameEdited);
        cy.contains('Guardar Cambios').click();

        // Verificar cambio
        cy.contains(sectionNameEdited).should('be.visible');

        // 5. Eliminar Sección
        cy.contains(sectionNameEdited)
            .parents('.group')
            .find('button[title="Eliminar sección"]')
            .click({ force: true });
        
        // Confirmar en el modal
        cy.contains('Eliminar Ahora').click();

        // 6. Verificar que ya no existe
        cy.contains(sectionNameEdited).should('not.exist');
    });

    it('Debe gestionar el ciclo de vida de un ROL (Crear, Editar, Eliminar)', () => {
        // 1. Ir a Roles
        cy.contains('Roles y Permisos').click();
        cy.contains('Gestión de accesos').should('be.visible');

        // 2. Crear Rol
        cy.contains('Nuevo Rol').click();
        cy.get('input[name="rol"]').type('Rol Cypress');
        cy.get('textarea[name="descripcion"]').type('Rol de prueba automatizada');
        
        // Asignar un permiso (ej. VER_DASHBOARD)
        cy.contains('VER_DASHBOARD').click({ force: true });
        
        cy.contains('Crear Rol').click();

        // 3. Verificar creación
        cy.contains('ROL CYPRESS').should('be.visible');

        // 4. Editar Rol
        cy.contains('ROL CYPRESS')
            .parents('.group')
            .find('button')
            .contains('EDITAR')
            .click({ force: true });
        
        cy.get('input[name="rol"]').clear().type('Rol Cypress Actualizado');
        cy.contains('Guardar Cambios').click();

        // Verificar cambio
        cy.contains('ROL CYPRESS ACTUALIZADO').should('be.visible');

        // 5. Eliminar Rol
        cy.contains('ROL CYPRESS ACTUALIZADO')
            .parents('.group')
            .find('button[title="Eliminar rol"]')
            .click({ force: true });
        
        // Confirmar
        cy.contains('Eliminar Ahora').click();

        // 6. Verificar eliminación
        cy.contains('ROL CYPRESS ACTUALIZADO').should('not.exist');
    });

});
