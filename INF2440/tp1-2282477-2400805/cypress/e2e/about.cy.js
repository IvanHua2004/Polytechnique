import { testHeader, testFooter } from "./shared";

describe('About Page', () => {

  beforeEach(() => {
    cy.visit('./src/about.html');
  });

  testHeader();

  it('should load successfully', () => {
    cy.url().should('include', 'about.html');
  });

  it('should have active class on the About link in the navigation', () => {
    cy.get('nav a[href="about.html"]').should('have.class', 'active');
  });

  it('should display one h1 heading and 3 h2 headings', () => {
    cy.get('h1').should('have.length', 1);
    cy.get('h2').should('have.length', 3);
  });

  it('should contain a list of 5 features', () => {
    cy.get('ul#features-list').should('exist');
    cy.get('ul#features-list li').should('have.length', 5);
  });

  testFooter();
});