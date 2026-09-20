import { SCORE_KEY } from "../../../src/assets/js/utils/consts";
import results from "../fixtures/results.json";
import { formatDate } from "../../../src/assets/js/utils/helper";

describe("Results page", () => {
    beforeEach(() => {
        localStorage.setItem(SCORE_KEY, JSON.stringify(results));
        cy.visit("/results");
    });

    it("should display message if no scores are available", () => {
        localStorage.removeItem(SCORE_KEY);
        cy.visit("/results");
        cy.get("#result-table-body").should("exist").and("contain.text", "Aucun score disponible.");
    });

    it("should display results table with correct number of entries", () => {
        // Tenir compte de l'entête du tableau
        cy.get("#result-table-body tr").should("have.length", results.length + 1);
    });

    it("should contain first entry with correct data", () => {
        cy.get("#result-table-body tr").eq(1).within(() => {
            cy.get("td").eq(0).should("have.text", results[0].name);
            cy.get("td").eq(1).should("have.text", results[0].score.toString());
            cy.get("td").eq(2).should("have.text", results[0].gameSize);
            cy.get("td").eq(3).should("have.text", formatDate(new Date(results[0].date)));
        });
    });

    // TODO : Tester que le bouton de suppression fonctionne correctement
    it("should delete all scores when delete button is clicked", () => {
        cy.get("#delete-score-btn").click();
        cy.get("#result-table-body")
            .should("exist")
            .and("contain.text", "Aucun score disponible");
        cy.window().then((win) => {
            expect(win.localStorage.getItem(SCORE_KEY)).to.be.null;
        });
    });

    // TODO : Tester l'affichage des scores moyens par taille de jeu
    it("should compute and display average scores when average button is clicked", () => {
        cy.get("#avg-score-btn").click();
        cy.get("#average-score-content li")
            .should("have.length.greaterThan", 0)
            .each((li) => {
                expect(li.text()).to.match(/La moyenne de score pour la taille du jeu \w+ est de \d+\.\d{2}/);
            });
    });

});