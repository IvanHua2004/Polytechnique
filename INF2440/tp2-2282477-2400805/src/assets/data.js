import { EBook, PrintedBook } from "./books.js";

/* eslint-disable no-magic-numbers */
const DEFAULT_DATA = [
    new PrintedBook("The Pragmatic Programmer", "Andrew Hunt", "9780135957059", 4.8, 352),
    new EBook("Design Patterns", "Erich Gamma", "9780201633610", 4.3, "MOBI"),
    new PrintedBook("Clean Code", "Robert C. Martin", "9780132350884", 4.6, 464),
    new EBook("You Don't Know JS", "Kyle Simpson", "9781491904244", 4.5, "PDF"),
    new PrintedBook("Eloquent JavaScript", "Marijn Simpson", "9781593279509", 2.4, 472),
    new EBook("JavaScript: The Good Parts", "Douglas Crockford", "9780596517748", 3.2, "EPUB"),
    new PrintedBook("Test Book", "Test Author", "1234567890123", null, 100)
];

export default DEFAULT_DATA;