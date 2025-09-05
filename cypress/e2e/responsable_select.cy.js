describe('Responsable select', () => {
  it('updates options with chantier and allows single choice', () => {
    cy.visit('index.html#lmra');
    cy.get('input[name="site"]').type('Chantier A');
    cy.get('select[name="responsable"] option').contains('Alice').should('exist');
    cy.get('select[name="responsable"]').select('Alice');
    cy.get('input[name="site"]').clear().type('Chantier B');
    cy.get('select[name="responsable"]').should('have.value', '');
    cy.get('select[name="responsable"] option').contains('Alice').should('not.exist');
    cy.get('select[name="responsable"] option').contains('Brigitte').should('exist');
    cy.get('select[name="responsable"]').select('Brigitte');
    cy.get('select[name="responsable"] option:selected').should('have.length', 1);
  });
});
