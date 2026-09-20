import { testHeader, testFooter } from "./shared";

describe('Book Page', () => {
    let bookData;

    before(() => {
        cy.fixture('data.json').then((data) => {
            bookData = data.find(book => book.id === 1);
        });
    });

    beforeEach(() => {
        cy.visit('./src/book.html?id=1');
    });

    testHeader();
    testFooter();

    it('should load successfully', () => {
        cy.url().should('include', 'book.html');
    });

    it('should display the book title as h1', () => {
        cy.get('h1').should('contain', bookData.title);
    });

    it('should display the book cover image', () => {
        cy.get('.book-cover').should('be.visible');
        cy.get('.book-cover').should('have.attr', 'src', bookData.image);
    });

    it('should display book information correctly', () => {
        cy.get('.book-info-item').should('have.length', 4);

        cy.get('.book-info-item').first().within(() => {
            cy.get('.book-info-label').should('contain', 'Auteur');
            cy.get('.book-info-value').should('contain', bookData.author);
        });

        cy.get('.book-info-item').eq(1).within(() => {
            cy.get('.book-info-label').should('contain', 'Genre');
            cy.get('.book-info-value').should('contain', bookData.genre);
        });

        cy.get('.book-info-item').eq(2).within(() => {
            cy.get('.book-info-label').should('contain', 'Pages');
            cy.get('.book-info-value').should('contain', `${bookData.pages} pages`);
        });

    });

    it('should display book description', () => {
        cy.get('.book-details p').should('be.visible');
        cy.get('.book-details p').should('contain', bookData.summary.substring(0, 30));
    });

    it('should display submissions section', () => {
        cy.get('.submissions h2').should('contain', 'Temps de lecture soumis');
        cy.get('.submission-item').should('have.length', bookData.comments.length);
    });

    describe('Submission Form', () => {
        it('should display the submission form', () => {
            cy.get('.form-section h2').should('contain', 'Soumettre votre temps de lecture');
            cy.get('form').should('exist');
        });

        it('should have all form fields', () => {
            cy.get('#hours').should('exist').and('have.attr', 'type', 'number');
            cy.get('#minutes').should('exist').and('have.attr', 'type', 'number');

            cy.get('input[name="format"]').should('have.length', 2);
            cy.get('input[value="electronic"]').should('exist');
            cy.get('input[value="paper"]').should('exist');

            cy.get('#comment').should('exist').and('have.attr', 'placeholder');

            cy.get('button[type=submit]').should('contain', 'Soumettre');
        });

        it('should submit the form when all required fields are filled', () => {
            cy.get('#hours').type('2');
            cy.get('#minutes').type('30');
            cy.get('input[value="electronic"]').check();

            cy.get('button[type=submit]').click();

            cy.url().should('include', 'book.html');
            cy.get('#hours').should('have.value', '');
        });

        it('should not submit the form if some required fields are missing', () => {
            cy.get('input[value="electronic"]').check();
            cy.get('button[type=submit]').click();

            cy.get('input:invalid').should('have.length', 2);
        });

        it('should not submit if minutes are outside of range', () => {
            cy.get('#hours').type('2');
            cy.get('#minutes').type('60');
            cy.get('input[value="electronic"]').check();

            cy.get('button[type=submit]').click();

            cy.get('#minutes:invalid').should('exist');
        });

        it('should not be able to resize the textarea to less than 100px height', () => {
            cy.get('#comment').invoke('css', 'height', '50px').should('have.css', 'height', '100px');
        });
    });
});
