
import { testHeader, testFooter } from "./shared";

describe('Main Page', () => {
    beforeEach(() => {
        cy.visit('./src/index.html');
    });

    testHeader();

    it('should load successfully', () => {
        cy.url().should('include', 'index.html');
    });

    describe('Search bar', () => {
        it('should contain a search bar in the header', () => {
            cy.get('header input[type="search"]').should('exist');
        });

        it('should be in a form with the correct method', () => {
            cy.get('header form').should('exist');
            cy.get('header form').should('have.attr', 'method', 'GET');
        });

        it('should search when pressing Enter', () => {
            const searchTerm = 'test';
            cy.get('header input[type="search"]').type(`${searchTerm}{enter}`);
            cy.url().should('include', 'index.html');
            cy.url().should('include', `q=${searchTerm}`);
        });
    });

    it('should contain 2 sections', () => {
        cy.get('section').should('have.length', 2);
    });

    describe('Filter Section', () => {
        it('should contain an input and select element in the first section', () => {
            cy.get('section:first-of-type input[type="range"]').should('exist');
            cy.get('section:first-of-type select').should('exist');
        });

        it('should update time value when changing the range input', () => {
            cy.get('#max-time').invoke('val', 15).trigger('input');
            cy.get('#time-display').should('contain', '15 heures');

        });

        it('should contain 5 choices in the select element', () => {
            const GENRES = ['Tous les genres', 'Fiction', 'Science-fiction', 'Fantasy', 'Historique'];
            cy.get('select option').should('have.length', GENRES.length).each((option, index) => {
                cy.wrap(option).should('contain', GENRES[index]);
            });
        });
    });

    describe('Book List', () => {
        it('should display a list of 3 books', () => {
            cy.get('.book-card').should('have.length', 3);
        });

        it('should display the correct book for the first card', () => {
            cy.get('.book-card').first().within(() => {
                cy.get('.book-title').should('contain', 'Le Petit Prince');
                cy.get('.book-author').should('contain', 'Antoine de Saint-Exupéry');
                cy.get('.book-genre').should('contain', 'Fiction');
                cy.get('.reading-time').should('contain', '2h 30m');
            });
        });

        it('each book should contain an image and a title with a link', () => {
            cy.get('.book-card').each(($book) => {
                cy.wrap($book).find('img').should('be.visible');
                cy.wrap($book).find('a').should('have.attr', 'href');
            });
        });

        it('should navigate to the book page when clicking on a book title', () => {
            cy.get('.book-card').first().find('a').click();
            cy.url().should('include', 'book.html');
        });

        it('should only have one column in the grid at 850px and two columns if above', () => {
            cy.viewport(850, 600);
            cy.get('section:last-of-type').invoke('css', 'grid-template-columns')
                .then(gridWidth => expect(gridWidth.split(' ').length).to.equal(1));

            cy.viewport(900, 1000);
            cy.get('section:last-of-type').invoke('css', 'grid-template-columns')
                .then(gridWidth => expect(gridWidth.split(' ').length).to.equal(2));
        });
    });

    describe('Media Queries', () => {
        it('should hide the search bar between 600 and 800px', () => {
            cy.viewport(700, 600);
            cy.get('header input[type="search"]').should('not.be.visible');

            cy.viewport(850, 600);
            cy.get('header input[type="search"]').should('be.visible');
        });

        it('should only display book name if under 800px', () => {
            cy.viewport(750, 600);
            cy.get('.book-card').each((book) => {
                cy.wrap(book).find('.book-title').should('be.visible');
                cy.wrap(book).find('.book-author').should('not.be.visible');
            });

            cy.viewport(850, 600);
            cy.get('.book-card').each((book) => {
                cy.wrap(book).find('.book-title').should('be.visible');
                cy.wrap(book).find('.book-author').should('be.visible');
            });
        });
    });

    testFooter();
});