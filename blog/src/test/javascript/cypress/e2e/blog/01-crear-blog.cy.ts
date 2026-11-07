import { entityCreateButtonSelector, entityCreateSaveButtonSelector, entityTableSelector } from '../../support/entity';

/**
 * Test E2E 1: un usuario logueado (login por API) crea un Blog desde el formulario
 * y lo ve en la lista de blogs.
 */
describe('Crear un Blog', () => {
  const nombreBlog = `Blog Cypress ${Date.now()}`;
  let blogCreado: { id: number } | undefined;

  beforeEach(() => {
    // Login por API: POST /api/authenticate y se guarda el token JWT (comando cy.login)
    cy.login(Cypress.expose('adminUsername'), Cypress.expose('adminPassword'));
    cy.intercept('POST', '/api/blogs').as('crearBlog');
    cy.intercept('GET', '/api/blogs+(?*|)').as('listarBlogs');
  });

  afterEach(() => {
    // Limpieza por API, para que el test se pueda repetir
    if (blogCreado) {
      cy.authenticatedRequest({ method: 'DELETE', url: `/api/blogs/${blogCreado.id}` });
      blogCreado = undefined;
    }
  });

  it('crea un blog desde el formulario y aparece en la lista', () => {
    cy.visit('/blog');
    cy.getEntityHeading('Blog').should('exist');

    cy.get(entityCreateButtonSelector).click();
    cy.getEntityCreateUpdateHeading('Blog').should('exist');
    cy.get('[data-cy="name"]').type(nombreBlog);
    cy.get('[data-cy="handle"]').type('cypress');
    cy.get(entityCreateSaveButtonSelector).click();

    cy.wait('@crearBlog').then(({ response }) => {
      expect(response?.statusCode).to.equal(201);
      blogCreado = response?.body;
    });
    cy.wait('@listarBlogs');
    cy.location('pathname').should('eq', '/blog');
    cy.get(entityTableSelector).should('contain', nombreBlog);
  });
});
