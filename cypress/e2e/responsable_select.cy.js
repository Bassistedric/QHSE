describe('Responsable input', () => {
  it('suggests responsables per chantier and allows free entry', () => {
    cy.visit('index.html#lmra');
    cy.get('input[name="site"]').type('Chantier A');
    cy.get('input[name="responsable"]').invoke('attr', 'list').then((id) => {
      cy.get(`datalist#${id} option[value="Alice"]`).should('exist');
    });
    cy.get('input[name="responsable"]').type('Alice');
    cy.get('input[name="site"]').clear().type('Chantier B');
    cy.get('input[name="responsable"]').should('have.value', '');
    cy.get('input[name="responsable"]').invoke('attr', 'list').then((id) => {
      cy.get(`datalist#${id} option[value="Alice"]`).should('not.exist');
      cy.get(`datalist#${id} option[value="Brigitte"]`).should('exist');
    });
    cy.get('input[name="responsable"]').type('Brigitte');
    cy.get('input[name="responsable"]').should('have.value', 'Brigitte');
  });
});
