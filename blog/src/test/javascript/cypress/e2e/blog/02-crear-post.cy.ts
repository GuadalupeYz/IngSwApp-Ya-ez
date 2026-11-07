import { entityCreateButtonSelector, entityCreateSaveButtonSelector, entityDetailsButtonSelector } from '../../support/entity';

/**
 * Test E2E 2: con login por API, se crea un Blog por API y después, desde el formulario,
 * un Post asignado a ese blog. Se abre el detalle del post y se verifica su contenido.
 */
describe('Crear un Post', () => {
  const nombreBlog = `Blog de posts ${Date.now()}`;
  const tituloPost = `Post Cypress ${Date.now()}`;
  let blog: { id: number; name: string };
  let postCreado: { id: number } | undefined;

  beforeEach(() => {
    // Login por API
    cy.login(Cypress.expose('adminUsername'), Cypress.expose('adminPassword'));
    // Preparación por API: el blog al que se va a asignar el post
    cy.authenticatedRequest({ method: 'POST', url: '/api/blogs', body: { name: nombreBlog, handle: 'posts' } }).then(({ body }) => {
      blog = body;
    });
    cy.intercept('POST', '/api/posts').as('crearPost');
    cy.intercept('GET', '/api/posts+(?*|)').as('listarPosts');
  });

  afterEach(() => {
    if (postCreado) {
      cy.authenticatedRequest({ method: 'DELETE', url: `/api/posts/${postCreado.id}` });
      postCreado = undefined;
    }
    cy.authenticatedRequest({ method: 'DELETE', url: `/api/blogs/${blog.id}` });
  });

  it('crea un post asignado a un blog y muestra su detalle', () => {
    cy.visit('/post');
    cy.get(entityCreateButtonSelector).click();
    cy.getEntityCreateUpdateHeading('Post').should('exist');

    cy.get('[data-cy="title"]').type(tituloPost);
    cy.get('[data-cy="content"]').type('Contenido escrito por un test de Cypress');
    cy.get('[data-cy="date"]').type('2026-11-13T10:00');
    cy.get('[data-cy="date"]').blur();
    cy.get('[data-cy="blog"]').select(nombreBlog);
    cy.get(entityCreateSaveButtonSelector).click();

    cy.wait('@crearPost').then(({ response }) => {
      expect(response?.statusCode).to.equal(201);
      postCreado = response?.body;
    });
    cy.wait('@listarPosts');

    // La lista viene ordenada del más viejo al más nuevo y pagina de a 20:
    // clic en la cabecera "ID" para ordenarla de más nuevo a más viejo
    cy.get('th[jhiSortBy="id"]').click();
    cy.wait('@listarPosts');

    // Abrir el detalle del post recién creado desde su fila en la lista
    cy.contains('tr', tituloPost).find(entityDetailsButtonSelector).click();
    cy.getEntityDetailsHeading('post').should('exist');
    cy.contains(tituloPost).should('be.visible');
    cy.contains('Contenido escrito por un test de Cypress').should('be.visible');
    cy.contains(nombreBlog).should('be.visible');
  });
});
