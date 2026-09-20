import config from "../fixtures/config.json";
import { GAME_CONFIG_KEY } from "../../../src/assets/js/utils/consts.js";

describe("Game page", () => {
  beforeEach(() => {
    sessionStorage.setItem(GAME_CONFIG_KEY, JSON.stringify(config));
    cy.visit("/game");
  });
  it("should display game board based on configuration", () => {
    cy.get("#game-board").should("exist");
    cy.get(".game-card-content").should("have.length", 12);
    cy.get("#remain-attempts").should("contain.text", "4");
  });

  it("should display only empty game board message if no configuration", () => {
    sessionStorage.removeItem(GAME_CONFIG_KEY);
    cy.visit("/game");
    cy.get("#game-info").should(
      "contain.text",
      "Aucune configuration de jeu trouvée. Veuillez retourner à la page d'accueil pour configurer le jeu."
    );
  });

  it("should update attempts when two cards have been clicked", () => {
    cy.visit("/game");

    cy.get(".game-card-back").then((cards) => {
      const firstCard = cards[0];
      const secondCard = cards[0].textContent === cards[1].textContent ? cards[2] : cards[1]; // garantir une carte différente

      cy.wrap(firstCard).parent().click();
      cy.wrap(secondCard).parent().click();
      cy.get("#remain-attempts").should("contain.text", "3");
    });
  });

  it("should flip cards back when they are not matched", () => {
    cy.visit("/game");

    cy.get(".game-card-back").then((cards) => {
      const firstCard = cards[0];
      const secondCard = cards[0].textContent === cards[1].textContent ? cards[2] : cards[1]; // garantir une carte différente

      cy.wrap(firstCard).parent().as("firstCard");
      cy.get("@firstCard").click();
      cy.wrap(secondCard).parent().as("secondCard");
      cy.get("@secondCard").click();
      cy.get("#remain-attempts").should("contain.text", "3");

      cy.wait(1100);

      cy.get("@firstCard").should("have.attr", "data-hidden", "true");
      cy.get("@secondCard").should("have.attr", "data-hidden", "true");
      cy.get("@firstCard").get(".game-card-front").should("have.css", "opacity", "1");
      cy.get("@firstCard").get(".game-card-back").should("have.css", "opacity", "0");
      cy.get("@secondCard").get(".game-card-front").should("have.css", "opacity", "1");
      cy.get("@secondCard").get(".game-card-back").should("have.css", "opacity", "0");

    });
  });

  it("should leave cards visible when they are matched", () => {
    cy.visit("/game");

    cy.get(".game-card-back").then((cards) => {
      const firstCard = cards[0];
      const secondCard = Array.from(cards).find((card) => card != firstCard && card.textContent === firstCard.textContent); // garantir une carte identique

      cy.wrap(firstCard).parent().as("firstCard");
      cy.get("@firstCard").click();
      cy.wrap(secondCard).parent().as("secondCard");
      cy.get("@secondCard").click();

      cy.wait(1100);

      cy.get("@firstCard").should("have.attr", "data-hidden", "false");
      cy.get("@secondCard").should("have.attr", "data-hidden", "false");
      cy.get("@firstCard").get(".game-card-front").should("have.css", "opacity", "0");
      cy.get("@firstCard").get(".game-card-back").should("have.css", "opacity", "1");
      cy.get("@secondCard").get(".game-card-front").should("have.css", "opacity", "0");
      cy.get("@secondCard").get(".game-card-back").should("have.css", "opacity", "1");

    });
  });

  it("should go to home page when not not trying again in chosen at the end", () => {
    const TEST_CONFIG = { ...config, maxAttempts: 1 };
    sessionStorage.setItem(GAME_CONFIG_KEY, JSON.stringify(TEST_CONFIG));

    cy.visit('/game', {
      onBeforeLoad: (win) => {
        cy.stub(win, 'confirm').returns(false);
      },
    });

    cy.get(".game-card-back").then((cards) => {
      const firstCard = cards[0];
      const secondCard = cards[0].textContent === cards[1].textContent ? cards[2] : cards[1]; // garantir une carte différente

      cy.wrap(firstCard).parent().as("firstCard");
      cy.get("@firstCard").click();
      cy.wrap(secondCard).parent().as("secondCard");
      cy.get("@secondCard").click();

      cy.wait(1100);
      cy.url().should("include", "/index.html");
    });
  });

  it("should create new game when try again is chosen at the end", () => {
    const TEST_CONFIG = { ...config, maxAttempts: 1 };
    sessionStorage.setItem(GAME_CONFIG_KEY, JSON.stringify(TEST_CONFIG));

    cy.visit('/game', {
      onBeforeLoad: (win) => {
        cy.stub(win, 'confirm').returns(true);
      },
    });

    cy.get(".game-card-back").then((cards) => {
      const firstCard = cards[0];
      const secondCard = cards[0].textContent === cards[1].textContent ? cards[2] : cards[1]; // garantir une carte différente

      cy.wrap(firstCard).parent().as("firstCard");
      cy.get("@firstCard").click();
      cy.wrap(secondCard).parent().as("secondCard");
      cy.get("@secondCard").click();

      cy.wait(1100);
      cy.get("#remain-attempts").should("contain.text", "1");
    });
  });

  it("should complete the game when all pairs are found", () => {
    const TEST_CONFIG = { ...config, gameSize: "2x2", maxAttempts: 10 };
    sessionStorage.setItem(GAME_CONFIG_KEY, JSON.stringify(TEST_CONFIG));

    cy.visit('/game', {
      onBeforeLoad: (win) => {
        cy.stub(win, 'prompt').returns('Jean Untel');
      },
    });

    cy.get(".game-card-back").then((cards) => {
      const card1 = cards[0]; // paire avec card2
      const card2 = Array.from(cards).find((card) => card != card1 && card.textContent === card1.textContent);
      const card3 = Array.from(cards).find((card) => card != card1 && card != card2); // 2e paire avec card4
      const card4 = Array.from(cards).find((card) => card != card1 && card != card2 && card != card3);

      cy.wrap(card1).parent().as("card1");
      cy.get("@card1").click();
      cy.wrap(card2).parent().as("card2");
      cy.get("@card2").click();

      cy.wrap(card3).parent().as("card3");
      cy.get("@card3").click();
      cy.wrap(card4).parent().as("card4");
      cy.get("@card4").click();

      cy.wait(1100);
      cy.url().should("include", "/results.html");
    });
  });

});