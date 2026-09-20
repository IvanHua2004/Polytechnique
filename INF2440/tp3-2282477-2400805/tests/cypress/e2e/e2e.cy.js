describe("E2E tests", () => {
    it("should configure a 2x2 game, play it, win and go to the results page", () => {
        cy.visit('/');

        cy.get('#game-size').select('2x2');
        cy.get('#max-attempts').clear().type('10');
        cy.get('#card-numbers').click();
        cy.get('#start-game-btn').click();

        cy.window().then((win) => {
            cy.stub(win, 'prompt').returns('Jean Untel').as('promptStub');
        });

        cy.url().should('include', '/game');
        cy.get('.game-card-back').should('have.length', 4);

        cy.get('.game-card-back').then(($cards) => {
            const cardMap = {};
            $cards.each((i, card) => {
                const value = card.textContent;
                if (!cardMap[value]) cardMap[value] = [];
                cardMap[value].push(card);
            });
            Object.values(cardMap).forEach(pair => {
                cy.wrap(pair[0]).click();
                cy.wrap(pair[1]).click();
            });
        });

        cy.get('@promptStub').should('have.been.called');

        cy.url().should('include', '/results');

        cy.get('#result-table-body tr').eq(1).within(() => {
            cy.get('td').eq(0).should('have.text', 'Jean Untel');
            cy.get('td').eq(2).should('have.text', '2x2');
        });

        cy.get('#avg-score-btn').click();
        cy.get('#average-score-content li')
            .should('have.length.greaterThan', 0)
            .each((li) => {
                expect(li.text()).to.match(/La moyenne de score pour la taille du jeu \w+ est de \d+\.\d{2}/);
            });
    });

});
