export class Library {
    constructor(books = []) {
        this.books = books;
    }

    /**
     * Formate les notes des livres en utilisant la stratégie fournie.
     * @param {function} strategy La fonction de formatage à utiliser.
     * @returns {Array<string>} Un tableau de chaînes formatées.
     */
    formatRatings(strategy) {
        return this.books.map(book => strategy(book));
    }

    /**
     * Ajoute un nouveau livre à la bibliothèque.
     * @param {Book} book Le livre à ajouter.
     * @returns {boolean} true si le livre a été ajouté, false si l'ISBN existe déjà.
     */
    addBook(book) {
        const existingBook = this.books.find(b => b.isbn === book.isbn);
        if (existingBook) {
            return false;
        }
        this.books.push(book);
        return true;
    }

    /**
     * Supprime un livre de la bibliothèque en utilisant son ISBN.
     * @param {string} isbn L'ISBN du livre à supprimer.
     * @returns {boolean} true si le livre a été supprimé, false sinon.
     */
    removeBookByIsbn(isbn) {
        const index = this.books.findIndex(book => book.isbn === isbn);
        const NOT_FOUND = -1;
        if (index !== NOT_FOUND) {
            this.books.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Recherche des livres par auteur.
     * @param {string} author Le nom de l'auteur à rechercher.
     * @param {boolean} exactMatch Si true, recherche exacte, sinon recherche partielle.
     * @returns {Array<Book>} Un tableau des livres trouvés.
     */
    searchByAuthor(author, exactMatch = false) {
        const searchTerm = author.toLowerCase().trim();

        return this.books.filter(book => {
            const bookAuthor = book.author.toLowerCase();

            if (exactMatch) {
                return bookAuthor === searchTerm;
            } else {
                return bookAuthor.includes(searchTerm);
            }
        });
    }

    /**
     * Calcule la note moyenne de tous les livres de la bibliothèque.
     * @returns {number|null} La note moyenne ou null s'il n'y a pas de livres avec des notes.
     */
    getAverageRating() {
        const booksWithRating = this.books.filter(book => book.rating !== null && book.rating !== undefined);

        if (booksWithRating.length === 0) {
            return null;
        }

        const totalRating = booksWithRating.reduce((sum, book) => sum + parseFloat(book.rating), 0);
        return totalRating / booksWithRating.length;
    }

    /**
     * Filtre les livres selon un critère de filtrage.
     * @param {function} filterFn La fonction de filtrage à appliquer.
     * @returns {Array<Book>} Un tableau des livres filtrés.
     */
    filterBooks(filterFn) {
        return this.books.filter(filterFn);
    }

    /**
     * Trie les livres selon un critère donné (bonus).
     * @param {string} criteria Le critère de tri ('title', 'author', 'rating').
     * @param {boolean} isAscending L'ordre de tri (true pour ascendant, false pour descendant).
     * @returns {Array<Book>} Un tableau des livres triés.
     */
    sortBooks(criteria, isAscending = true) {
        const sortedBooks = [...this.books];

        sortedBooks.sort((a, b) => {
            let valueA, valueB;

            switch (criteria) {
                case 'title':
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
                    break;
                case 'author':
                    valueA = a.author.toLowerCase();
                    valueB = b.author.toLowerCase();
                    break;
                case 'rating':
                    valueA = a.rating || 0;
                    valueB = b.rating || 0;
                    break;
                default:
                    return 0;
            }

            const LESS = -1;
            const GREATER = 1;

            if (valueA < valueB) {
                return isAscending ? LESS : GREATER;
            }
            if (valueA > valueB) {
                return isAscending ? GREATER : LESS;
            }
            return 0;
        });

        return sortedBooks;
    }
}