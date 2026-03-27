describe('DATASUS - Validação da Homepage', () => {

  it('deve carregar a página principal com sucesso', () => {
    cy.visit('/')
    cy.title().should('not.be.empty')
    cy.url().should('include', 'datasus.saude.gov.br')
  })

  it('deve exibir o menu de navegação principal', () => {
    cy.visit('/')
    cy.get('nav').should('be.visible')
  })

})