/* eslint-disable no-magic-numbers */
import { EBook, PrintedBook } from "../src/assets/books.js";
import { createRatingFilter, starFormatStrategy, numberFormatStrategy } from "../src/assets/utils.js";

describe("Utils tests", () => {
    const books = [
        new EBook("Book 1", "Author 1", "1234567890123", 4.6, "PDF"),
        new EBook("Book 2", "Author 2", "1234567890124", 3.0, "EPUB"),
        new PrintedBook("Book 3", "Author 3", "1234567890125", 5.0, 300),
        new PrintedBook("Book 4", "Author 4", "1234567890126", 2.2, 200),
    ];

    describe("createRatingFilter", () => {
        it("createRatingFilter should filter books by rating", () => {
            const filter = createRatingFilter({ min: 3, max: 5 });
            const filteredBooks = books.filter(filter);
            expect(filteredBooks.length).toBe(3);
            expect(filteredBooks[0].title).toBe("Book 1");
            expect(filteredBooks[1].title).toBe("Book 2");
            expect(filteredBooks[2].title).toBe("Book 3");
        });

        it("createRatingFilter should return empty array for no matches", () => {
            const filter = createRatingFilter({ min: 6, max: 10 });
            const filteredBooks = books.filter(filter);
            expect(filteredBooks.length).toBe(0);
        });

        it("createRatingFilter should ignore books without rating", () => {
            const filter = createRatingFilter({ min: 1, max: 5 });
            const noRatingBook = new EBook("Book 5", "Author 5", "1234567890127", null, "MOBI");
            const filteredBooks = (books.concat(noRatingBook)).filter(filter);
            expect(filteredBooks.length).toBe(4);
            expect(filteredBooks[3].title).toBe("Book 4");
        });
    });

    describe("startFormatStrategy", () => {
        it("starFormatStrategy should format book title and rating with stars", () => {
            const book = books[1];
            const formatted = starFormatStrategy(book);
            expect(formatted).toBe("Book 2: ★★★☆☆");
        });

        it("startFormatStrategy should round to nearest star", () => {
            const bookRoundUp = books[0];
            const formattedRoundUp = starFormatStrategy(bookRoundUp);
            expect(formattedRoundUp).toBe("Book 1: ★★★★★");

            const bookRoundDown = books[3];
            const formattedRoundDown = starFormatStrategy(bookRoundDown);
            expect(formattedRoundDown).toBe("Book 4: ★★☆☆☆");
        });

        it("starFormatStrategy should handle undefined rating", () => {
            const noRatingBook = new EBook("Book 5", "Author 5", "1234567890127", null, "MOBI");
            const formatted = starFormatStrategy(noRatingBook);
            expect(formatted).toBe("Book 5: Pas de note");
        });
    });

    describe("numberFormatStrategy", () => {
        it("numberFormatStrategy should format book title and rating as number", () => {
            const book = books[2];
            const formatted = numberFormatStrategy(book);
            expect(formatted).toBe("Book 3 : 5");
        });

        it("numberFormatStrategy should round to nearest number", () => {
            const bookRoundUp = books[0];
            const formatted = numberFormatStrategy(bookRoundUp);
            expect(formatted).toBe("Book 1 : 4.5");

            const bookRoundDown = books[3];
            const formattedDown = numberFormatStrategy(bookRoundDown);
            expect(formattedDown).toBe("Book 4 : 2");
        });

        it("numberFormatStrategy should handle undefined rating", () => {
            const noRatingBook = new EBook("Book 5", "Author 5", "1234567890127", null, "MOBI");
            const formatted = numberFormatStrategy(noRatingBook);
            expect(formatted).toBe("Book 5 : Pas de note");
        });
    });

});