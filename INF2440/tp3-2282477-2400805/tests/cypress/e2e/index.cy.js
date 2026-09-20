import config from "../fixtures/config.json";
import { GAME_CONFIG_KEY } from "../../../src/assets/js/utils/consts.js";

describe('Configuration page', () => {

  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to game page after submission', () => {
    cy.get('#game-size').select('4x3');
    cy.get('#max-attempts').clear().type('5');
    cy.get('#card-numbers').click();
    cy.get('#start-game-btn').click();
    cy.url().should('include', '/game');
  });

  it('should not be able to submit unless all fields are filled', () => {
    cy.get('#max-attempts').type('5');
    cy.get('#start-game-btn').click();
    cy.get('#game-size:invalid').should('exist');
  });

  it('should not accept negative attempts', () => {
    cy.get('#game-size').select('4x3');
    cy.get('#card-numbers').click();
    cy.get('#max-attempts').clear().type('-5');
    cy.get('#start-game-btn').click();
    cy.get('#max-attempts:invalid').should('exist');
  });

  describe('Configuration storage', () => {

    it('should save config to sessionStorage after submission', () => {
      cy.get('#game-size').select('4x3');
      cy.get('#max-attempts').clear().type('5');
      cy.get('#card-numbers').click();
      cy.get('#start-game-btn').click();
      cy.url().should('include', '/game');

      cy.getAllSessionStorage().then(storage => {
        const config = JSON.parse((storage['http://localhost:3000'])[GAME_CONFIG_KEY]);
        expect(config).to.have.property('gameSize', '4x3');
        expect(config).to.have.property('cardType', 'numbers');
        expect(config).to.have.property('maxAttempts', 5);
      });
    });

    it('should load config to page if exists in storage', () => {
      sessionStorage.setItem(GAME_CONFIG_KEY, JSON.stringify(config));
      cy.visit('/');

      cy.get('#game-size').should('have.value', config.gameSize);
      cy.get('#max-attempts').should('have.value', config.maxAttempts);
      cy.get('#card-numbers').should('be.checked');
    });

    it('should display default values if no config exists in storage', () => {
      cy.clearAllSessionStorage();
      cy.visit('/');

      cy.get('#game-size').should('have.value', '');
      cy.get('#max-attempts').should('have.value', '10');
      cy.get('#card-numbers').should('be.checked');
      cy.get('#card-letters').should('not.be.checked');
    });
  });

});