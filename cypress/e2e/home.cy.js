describe('Home page', () => {
  it('shows the home title', () => {
    cy.visit('index.html');
    cy.contains('QHSE – Apps chantier').should('be.visible');
  });
});
