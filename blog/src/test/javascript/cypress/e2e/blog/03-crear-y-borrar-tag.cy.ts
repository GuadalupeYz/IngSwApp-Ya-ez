import {
  entityConfirmDeleteButtonSelector,
  entityCreateButtonSelector,
  entityCreateSaveButtonSelector,
  entityDeleteButtonSelector,
  entityTableSelector,
} from '../../support/entity';

/**
 * Test E2E 3: con login por API, se crea un Tag desde el formulario y después se lo borra
 * desde la lista, confirmando el diálogo de borrado.
 */
describe('Crear y borrar un Tag', () => {
  const nombreTag = `tag-${Date.now()}`;
  let tagCreado: { id: number } | undefined;

  beforeEach(() => {
    // Login por API
    cy.login(Cypress.expose('adminUsername'), Cypress.expose('adminPassword'));
    cy.intercept('POST', '/api/tags').as('crearTag');
    cy.intercept('DELETE', '/api/tags/*').as('borrarTag');
    cy.intercept('GET', '/api/tags+(?*|)').as('listarTags');
  });

  afterEach(() => {
    // Limpieza por API si el test falló antes de borrar el tag
    if (tagCreado) {
      cy.authenticatedRequest({ method: 'DELETE', url: `/api/tags/${tagCreado.id}`, failOnStatusCode: false });
      tagCreado = undefined;
    }
  });

  it('crea un tag, lo ve en la lista y lo borra', () => {
    cy.visit('/tag');
    cy.get(entityCreateButtonSelector).click();
    cy.getEntityCreateUpdateHeading('Tag').should('exist');
    cy.get('[data-cy="name"]').type(nombreTag);
    cy.get(entityCreateSaveButtonSelector).click();

    cy.wait('@crearTag').then(({ response }) => {
      expect(response?.statusCode).to.equal(201);
      tagCreado = response?.body;
    });
    cy.wait('@listarTags');

    // La lista viene ordenada del más viejo al más nuevo y pagina de a 20:
    // clic en la cabecera "ID" para ordenarla de más nuevo a más viejo
    cy.get('th[jhiSortBy="id"]').click();
    cy.wait('@listarTags');
    cy.get(entityTableSelector).should('contain', nombreTag);

    // Borrar el tag desde su fila y confirmar
    cy.contains('tr', nombreTag).find(entityDeleteButtonSelector).click();
    cy.getEntityDeleteDialogHeading('tag').should('exist');
    cy.get(entityConfirmDeleteButtonSelector).click();

    cy.wait('@borrarTag').its('response.statusCode').should('eq', 204);

    // Se recarga la lista y el tag ya no aparece; por API, tampoco existe
    cy.visit('/tag?sort=id,desc');
    cy.wait('@listarTags');
    cy.get(entityTableSelector).should('not.contain', nombreTag);
    cy.then(() => {
      cy.authenticatedRequest({ url: `/api/tags/${tagCreado?.id}`, failOnStatusCode: false })
        .its('status')
        .should('eq', 404);
      tagCreado = undefined;
    });
  });
});
