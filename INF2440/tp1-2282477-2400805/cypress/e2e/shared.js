export function testHeader() {
  describe('Header', () => {
    it('text and background should be different colors', () => {
      cy.get('header').then(el => {
        expect(el.css('background-color')).to.not.equal(el.css('color'));
      });
    });

    it('should contain a nav element', () => {
      cy.get('nav').should('exist');
    });

    it('should contain a nav element with 3 links', () => {
      cy.get('nav a').should('have.length', 3);
    });

    it('nav elements should contain correct links', () => {
      const EXPECTED_LINKS = ['index.html', 'add.html', 'about.html'];
      cy.get('nav a').each((link, i) => {
        cy.wrap(link.attr('href')).should('eq', EXPECTED_LINKS[i]);
      });
    });

    it('should navigate back to home when clicking logo', () => {
      cy.get('.logo').click();
      cy.url().should('include', 'index.html');
    });

    it('should be the first element in the body', () => {
      cy.get('body').children().first().should('have.prop', 'tagName', 'HEADER');
    });

  });
}

export function testFooter() {
  describe('Footer', () => {
    it('Page should have a footer element', () => {
      cy.get('footer').should('exist');
    });

    it('Footer should have 2 student names with id etudiant-1 and etudiant-2', () => {
      const EXPECTED_ID = ['etudiant-1', 'etudiant-2'];
      cy.get('footer span').should('have.length', 2).each((el, i) => {
        cy.wrap(el).should('have.id', EXPECTED_ID[i]);
      })
    });

    it('Footer should be at the bottom and aligned in the center', () => {
      cy.get('body').should('have.css', 'flex-direction', 'column');
      cy.get('footer').should('have.css', 'text-align', 'center');
    });
  });
}