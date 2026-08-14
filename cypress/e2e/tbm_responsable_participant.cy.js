function currentIsoWeek() {
  const date = new Date();
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
}

describe('TBM responsable participant', () => {
  it('checks and validates the selected responsable in the participants list', () => {
    const week = currentIsoWeek();
    const affectations = [
      'annee,semaine,pm,sisu,ce,ouvrier,chantier,nbcolonnes,sheet,row',
      `2026,${week},,,Alice Responsable,Ouvrier Un,Chantier Test,1,EQUIPE_ELEC,1`,
      `2026,${week},,,Bob Responsable,Ouvrier Deux,Chantier Test,1,EQUIPE_ELEC,2`,
    ].join('\n');

    cy.intercept('GET', '**gid=496527492**', {
      statusCode: 200,
      headers: { 'content-type': 'text/csv' },
      body: affectations,
    });
    cy.intercept('GET', '**gid=2013584163**', {
      statusCode: 200,
      headers: { 'content-type': 'text/csv' },
      body: 'mois,url',
    });

    cy.visit('tbm.html');
    cy.get('#metier').select('Elec');

    cy.get('#responsableSelect').select('Alice Responsable');
    cy.get('#teamContainer input[data-responsable="true"]')
      .should('have.value', 'Alice Responsable')
      .and('be.checked')
      .and('be.disabled');
    cy.get('#teamContainer').should('contain.text', 'Responsable validé');
    cy.get('#teamContainer input[value="Ouvrier Un"]').should('not.be.checked');

    cy.get('#responsableSelect').select('Bob Responsable');
    cy.get('#teamContainer input[data-responsable="true"]')
      .should('have.value', 'Bob Responsable')
      .and('be.checked');
    cy.get('#teamContainer input[value="Alice Responsable"]').should('not.exist');
  });
});
