describe('TBM manual fields', () => {
  it('allows manual chantier and responsable entries', () => {
    cy.visit('tbm.html');
    cy.get('#chantierManual').type('Chantier X');
    cy.get('#chantierSelect').should('be.disabled');
    cy.get('#responsableManual').type('Responsable Y');
    cy.get('#responsableSelect').should('be.disabled');
  });
});
