import { Book, EBook, PrintedBook } from "../src/assets/books.js";

describe("Book tests", () => {

    const title = "Test Book";
    const author = "Test Author";
    const isbn = "1234567890123";
    const rating = 4.5;
    const format = "PDF";
    const pageCount = 300;

    it("should create a new book", () => {
        const book = new Book(title, author, isbn, rating);
        expect(book.title).toBe(title);
        expect(book.author).toBe(author);
        expect(book.isbn).toBe(isbn);
        expect(book.rating).toBe(rating);
    });
    it("getInfo should return book info", () => {
        const book = new Book(title, author, isbn, rating);
        expect(book.getInfo()).toBe("Test Book par Test Author (ISBN: 1234567890123) - 4.5/5");
    });
    it("should handle book without rating", () => {
        const book = new Book(title, author, isbn);
        expect(book.getInfo()).toBe("Test Book par Test Author (ISBN: 1234567890123)");
    });

    it("EBook should have format", () => {
        const ebook = new EBook(title, author, isbn, rating, format);
        expect(ebook.format).toBe(format);
    });
    it("EBook getInfo should include format", () => {
        const ebook = new EBook(title, author, isbn, rating, format);
        expect(ebook.getInfo()).toBe(`${title} par ${author} (ISBN: ${isbn}) - ${rating}/5 [E-Book: ${format}]`);
    });

    it("PrintedBook should have pageCount", () => {
        const printedBook = new PrintedBook(title, author, isbn, rating, pageCount);
        expect(printedBook.pageCount).toBe(pageCount);
    });
    it("PrintedBook getInfo should include pageCount", () => {
        const printedBook = new PrintedBook(title, author, isbn, rating, pageCount);
        expect(printedBook.getInfo()).toBe(`${title} par ${author} (ISBN: ${isbn}) - ${rating}/5 [${pageCount} pages]`);
    });

    it("EBook should have Book in its prototype chain", () => {
        const ebook = new EBook(title, author, isbn, rating, format);
        const proto = Object.getPrototypeOf(ebook);
        expect(Object.getPrototypeOf(proto)).toBe(Book.prototype);
    });

    it("PrintedBook should have Book in its prototype chain", () => {
        const printedBook = new PrintedBook(title, author, isbn, rating, pageCount);
        const proto = Object.getPrototypeOf(printedBook);
        expect(Object.getPrototypeOf(proto)).toBe(Book.prototype);
    });
});