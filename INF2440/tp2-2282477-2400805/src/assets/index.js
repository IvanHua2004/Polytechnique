import { Library } from './library.js';
import DEFAULT_DATA from './data.js';
import { EBook } from './books.js';
import { createRatingFilter, starFormatStrategy, numberFormatStrategy } from './utils.js';

const myLibrary = new Library(DEFAULT_DATA);

const displayBooks = (books) => {
    const list = document.getElementById('book-list');
    list.innerHTML = '';
    books.forEach(book => {
        const li = document.createElement('li');
        li.textContent = book.getInfo();
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.addEventListener('click', () => {
            myLibrary.removeBookByIsbn(book.isbn);
            displayBooks(myLibrary.books);
        }
        );
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });

    // Afficher la note moyenne des livres à 2 décimales ou 'N/A' s'il n'y a pas de notes
    const avgElement = document.getElementById('avg-rating');
    const averageRating = myLibrary.getAverageRating();
    avgElement.textContent = averageRating !== null ? averageRating.toFixed(2) : 'N/A';
};

function bindListeners(library) {
    const getInputValue = id => document.getElementById(id).value.trim();
    const clearInputs = (...ids) => ids.forEach(id => document.getElementById(id).value = '');

    document.getElementById('add-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = getInputValue('title');
        const author = getInputValue('author');
        const isbn = getInputValue('isbn');
        const type = getInputValue('ebook-type');
        let rating = getInputValue('rating');

        // Valider la note si présente
        if (rating !== '' && rating !== null) {
            const ratingNum = parseFloat(rating);
            if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
                alert("La note doit être un nombre entre 0 et 5.");
                return;
            }
            rating = ratingNum;
        } else {
            rating = null;
        }

        // Ajouter un nouveau livre électronique à la bibliothèque et mettre à jour l'affichage
        const newBook = new EBook(title, author, isbn, rating, type);
        const bookAdded = library.addBook(newBook);
        if (!bookAdded) {
            alert("Un livre avec cet ISBN existe déjà.");
            return;
        }
        displayBooks(library.books);
        clearInputs('title', 'author', 'isbn', 'rating');
    });

    document.getElementById('search-author-btn').addEventListener('click', () => {
        const author = getInputValue('author-search');
        const exactMatch = document.getElementById('exact-match').checked;
        // Rechercher les livres par auteur et afficher les résultats
        const books = library.searchByAuthor(author, exactMatch);
        const result = document.getElementById('author-search-result');
        result.innerHTML = '';
        if (books.length > 0) {
            books.forEach(book => {
                const p = document.createElement('p');
                p.textContent = book.getInfo();
                p.id = `book-${book.isbn}`;
                result.appendChild(p);
            });
        } else {
            result.textContent = 'Aucun livre trouvé pour cet auteur.';
        }
    });
}

function bindUtilsListeners(library) {
    const writeToOutput = (formattedBooks) => {
        const output = document.getElementById('strat-output');
        output.innerHTML = '';
        formattedBooks.forEach(book => {
            const p = document.createElement('p');
            p.textContent = book;
            output.appendChild(p);
        });
    }
    // Appliquer la stratégie de formatage avec étoiles
    document.getElementById('strat-stars').addEventListener('click', () => {
        const formattedRatings = library.formatRatings(starFormatStrategy);
        writeToOutput(formattedRatings);
    });

    // Appliquer la stratégie de formatage avec chiffres
    document.getElementById('strat-numbers').addEventListener('click', () => {
        const formattedRatings = library.formatRatings(numberFormatStrategy);
        writeToOutput(formattedRatings);
    });

    // Appliquer le filtre de notes si les valeurs sont valides
    document.getElementById('filter-btn').addEventListener('click', () => {
        const min = parseFloat(document.getElementById('min-rating').value);
        const max = parseFloat(document.getElementById('max-rating').value);
        if (!isNaN(min) && !isNaN(max) && min <= max) {
            const filter = createRatingFilter({ min, max });
            const filteredBooks = library.filterBooks(filter);
            const result = document.getElementById('strat-output');
            result.innerHTML = '';
            filteredBooks.forEach(book => {
                const p = document.createElement('p');
                p.textContent = book.getInfo();
                result.appendChild(p);
            });
        }
    });
}

function bindSortListeners(library) {
    let isAscending = true;
    const sortBtn = document.getElementById('sort-btn');

    sortBtn.addEventListener('click', () => {
        const criteria = document.getElementById('sort-criteria').value;

        // Trier directement les livres de la bibliothèque
        library.books = library.sortBooks(criteria, isAscending);

        // Mettre à jour l'affichage
        displayBooks(library.books);

        // Alterner l'ordre de tri
        isAscending = !isAscending;
        sortBtn.textContent = `Trier (${isAscending ? '↑' : '↓'})`;
    });
}

function init(library) {
    bindListeners(library);
    displayBooks(library.books);
    bindUtilsListeners(library);
    bindSortListeners(library);
}

init(myLibrary);