/* eslint-disable no-magic-numbers */
import { EBook, PrintedBook } from "../src/assets/books.js";
import { Library } from "../src/assets/library.js";

describe("Library tests", () => {
    let library;

    beforeEach(() => {
        library = new Library([
            new EBook("Book 1", "Author 1", "1234567890123", 4.6, "PDF"),
            new EBook("Book 2", "Author 2", "1234567890124", 3.0, "EPUB"),
            new PrintedBook("Book 3", "Author 3", "1234567890125", 5.0, 300),
            new PrintedBook("Book 4", "Author 4", "1234567890126", 2.2, 200),
        ]);
    });

    it("formatRatings should apply any strategy to format book ratings", () => {
        const newStrategy = book => `${book.title} : ${book.author}`;
        const formattedBooks = library.formatRatings(newStrategy);
        expect(formattedBooks[0]).toBe("Book 1 : Author 1");
        expect(formattedBooks[1]).toBe("Book 2 : Author 2");
        expect(formattedBooks[2]).toBe("Book 3 : Author 3");
        expect(formattedBooks[3]).toBe("Book 4 : Author 4");
    });

});