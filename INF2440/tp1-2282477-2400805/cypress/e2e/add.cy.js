import { testHeader, testFooter } from "./shared";

describe('Add Page', () => {
    beforeEach(() => {
        cy.visit('./src/add.html');
    });

    testHeader();

    it('should load successfully', () => {
        cy.url().should('include', 'add.html');
    });

    it('should contain 2 sections', () => {
        cy.get('section').should('have.length', 2);
    });

    it('should have an image with the correct src', () => {
        cy.get('#image-preview').should('have.attr', 'src', 'images/mis.jpeg');
    });

    describe('Form Validation', () => {
        it('should contain a single form', () => {
            cy.get('form').should('have.length', 1);
        });

        it('should contain 6 form-group elements', () => {
            cy.get('.form-group').should('have.length', 6);
        });

        it('should contain 4 input elements, 1 select element and 1 textarea elements', () => {
            cy.get('input').should('have.length', 4);
            cy.get('select').should('have.length', 1);
            cy.get('textarea').should('have.length', 1);
        });

        it('should contain 5 options in the genre select', () => {
            const GENRES = ['Sélectionnez un genre', 'Fiction', 'Science-fiction', 'Fantasy', 'Historique'];
            cy.get('select option').should('have.length', 5).each((option, index) => {
                cy.wrap(option).should('contain', GENRES[index]);
            });
        });

        it('should submit the form if all fields are valid', () => {
            cy.get('#title').type('Test Book');
            cy.get('#author').type('Test Author');
            cy.get('#pages').type('300');
            cy.get('select').select('Fiction');
            cy.get('#description').type('Test description.');
            cy.get('#cover-image').selectFile('./src/images/mis.jpeg');

            cy.get('form').submit();
            cy.get('#title').should('have.value', ''); // Rechargement de la page
        });

        it('should not submit the form if a required field is empty', () => {
            cy.get('#title').type('Test Book');
            cy.get('#author').type('Test Author');
            cy.get('#pages').type('300');
            cy.get('select').select('Fiction');
            cy.get('#description').type('Test description.');
            // Ne pas sélectionner l'image

            cy.get('form').submit();
            cy.get('#cover-image:invalid').should('exist');
        });

        it('should not submit the form if the author field is too short', () => {
            cy.get('#title').type('Test Book');
            cy.get('#author').type('AB'); // Trop court
            cy.get('#pages').type('300');
            cy.get('select').select('Fiction');
            cy.get('#description').type('Test description.');
            cy.get('#cover-image').selectFile('./src/images/mis.jpeg');

            cy.get('form').submit();
            cy.get('#author:invalid').should('exist');
        });
    });

    testFooter();
});