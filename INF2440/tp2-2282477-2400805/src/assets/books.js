export class Book {
    constructor(title, author, isbn, rating = null) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.rating = rating;
    }

    getInfo() {
        return `${this.title} par ${this.author} (ISBN: ${this.isbn})${this.rating !== null ? ` - ${this.rating}/5` : ''}`;
    }
}

export class EBook extends Book {
    constructor(title, author, isbn, rating, format) {
        super(title, author, isbn, rating);
        this.format = format;
    }

    getInfo() {
        return `${super.getInfo()} [E-Book: ${this.format}]`;
    }
}

export class PrintedBook extends Book {
    constructor(title, author, isbn, rating, pageCount) {
        super(title, author, isbn, rating);
        this.pageCount = pageCount;
    }

    getInfo() {
        return `${super.getInfo()} [${this.pageCount} pages]`;
    }
}