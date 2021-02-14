import Console from "./consoleHandling.service";
import Uuid from "./uuid.service";
import { FileHandler } from "../classes/FileHandler";

import { Book } from "../classes/Book";
import { Author } from "../classes/Author";
import { BookDAO } from "../types/bookdao.type";
import { AuthorDAO } from "../types/authordao.type";

enum SaveOption {
    all,
    books,
    authors,
    genres
};

class BookDatabaseService {

    private static instance: BookDatabaseService = new BookDatabaseService()

    private readonly PATH_AUTHORS: string = "../data/authors.json";
    private readonly PATH_BOOKS: string = "../data/books.json";
    private readonly PATH_GENRES: string = "../data/genres.json";

    private _books: Book[] = [];
    private _authors: Author[] = [];
    private _genres: string[] = [];

    private _numBooksViewed: number = 0;

    constructor() {
        if (BookDatabaseService.instance) {
            throw new Error("Instance of BookDatabaseService already existing");
        }
        BookDatabaseService.instance = this;

        this.init();
    }

    public static getInstance(): BookDatabaseService {
        return BookDatabaseService.instance;
    }

    private init(): void {
        const fileHandler = new FileHandler();

        fileHandler.readArrayFile(this.PATH_BOOKS).forEach((bookDAO: BookDAO) => {
            this._books.push(new Book(bookDAO));
        });

        fileHandler.readArrayFile(this.PATH_AUTHORS).forEach((authorDAO: AuthorDAO) => {
            this._authors.push(new Author(authorDAO));
        });

        this._genres = fileHandler.readArrayFile(this.PATH_GENRES);

        // add missing genres from books
        this._books.forEach((book: Book) => {
            this.addGenre(book.getGenre().toString());
        });
        this.saveDataToFiles(SaveOption.genres);

        // count numbers of books written for each author
        for (const author of this._authors) {
            const numberOfBooks = this._books.filter((book: Book) => {
                return book.getAuthors().filter((a: any) => a.name == author.authorsName).length > 0;
            }).length;
            author.numberOfBooks = numberOfBooks;
        }


    }

    public getAuthors(): Author[] {
        return this._authors;
    }

    private addGenre(genre: string): boolean {
        if (!this._genres.includes(genre)) {
            this._genres.push(genre);
            return true;
        }
        else {
            return false;
        }
    }

    private addAuthor(newAuthor: Author): boolean {
        if (!this._authors.find((author: Author) => author.uuid == newAuthor.uuid)) {
            this._authors.push(newAuthor);
            return true;
        }
        else {
            return false;
        }
    }

    private addBook(newBook: Book): boolean {
        if (!this._books.find((book: Book) => book.getISBN() == newBook.getISBN())) {
            this._books.push(newBook);
            return true;
        }
        else {
            return false;
        }
    }

    public showAllBooksInDb(): void {
        Console.print();

        for (let index in this._books) {
            let book: Book = this._books[index];
            let _index: Number = Number.parseInt(index) + 1;
            Console.print(`${_index}. \"${book.getBookName()}\", geschrieben von ${book.getAuthorsAsString()} und am ${book.getReleaseDate()} veröffentlicht`);
        }
    }

    public async searchForBook(): Promise<void> {
        const searchStr: String = await Console.question("Buchtitel / ISBN: ");
        const isISBN13: boolean = /^(?:978|979)-[0-9]{10}$/.test(searchStr.toString());

        let searchResult: Book[];
        if (isISBN13) {
            searchResult = this._books.filter((book: Book) => {
                return book.getISBN().replace(/(-)/g, "") === searchStr.replace(/(-)/g, "");
            });
        }
        else {
            searchResult = this._books.filter((book: Book) => {
                return book.getBookName().toLowerCase().includes(searchStr.toLowerCase()) && searchStr.length > 0;
            });
        }

        if (searchResult.length < 1) {
            Console.print();
            Console.print("Keine übereinstimmenden Bücher gefunden.");
            Console.print();
            return;
        }

        // sort by book title alphabetically
        searchResult.sort((_a: Book, _b: Book) => {
            const a = _a.getBookName().toLowerCase();
            const b = _b.getBookName().toLowerCase();

            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });

        const options: string[] = [];
        searchResult.forEach((book: Book, index) => {
            options.push(`${index + 1}: \"${book.getBookName()}\" von ${book.getAuthorsAsString()}`);
        });

        Console.print();
        Console.print(`Suchergebnisse für \"${searchStr}\":`)
        let answer: number = Number.parseInt((await Console.showPossibilities(options, "Auswahl: ")).toString());

        if (!isNaN(answer) && answer > 0 && answer <= searchResult.length) {
            const selectedBook: Book = searchResult[answer - 1];
            this.printBookDetails(selectedBook);
        }
        else {
            Console.print("Ungültige Eingabe!");
        }
    }

    public async searchForAuthor(): Promise<void> {
        const searchStr: String = await Console.question("Name des Autors: ");
        const searchResult: Author[] = this._authors.filter((author: Author) => {
            return author.authorsName.toLowerCase().includes(searchStr.toLowerCase()) && searchStr.length > 0;
        });

        if (searchResult.length < 1) {
            Console.print();
            Console.print("Keine übereinstimmenden Autoren gefunden.");
            Console.print();
            return;
        }

        const options: string[] = [];
        searchResult.forEach((author: Author, index) => {
            options.push(`${index + 1}: ${author.authorsName}`);
        });

        Console.print();
        Console.print(`Suchergebnisse für \"${searchStr}\":`)
        let answer: number = Number.parseInt((await Console.showPossibilities(options, "Auswahl: ")).toString());

        if (!isNaN(answer) && answer > 0 && answer <= searchResult.length) {
            const selectedAuthor: Author = searchResult[answer - 1];
            this.printAuthorDetails(selectedAuthor);
        }
        else {
            Console.print("Ungültige Eingabe!");
        }
    }

    public async searchForGenre(): Promise<void> {
        const searchStr: String = await Console.question("Genre/Rubrik: ");
        const searchResult: string[] = this._genres.filter((genre: String) => {
            return genre.toLowerCase().includes(searchStr.toLowerCase()) && searchStr.length > 0;
        });

        if (searchResult.length < 1) {
            Console.print();
            Console.print("Keine übereinstimmenden Genres gefunden.");
            Console.print();
            return;
        }

        // sort by book title alphabetically
        searchResult.sort();

        const options: string[] = [];
        searchResult.forEach((genre: string, index) => {
            options.push(`${index + 1}: ${genre}`);
        });

        Console.print();
        Console.print(`Suchergebnisse für \"${searchStr}\":`)
        let answer: number = Number.parseInt((await Console.showPossibilities(options, "Auswahl: ")).toString());

        if (!isNaN(answer) && answer > 0 && answer <= searchResult.length) {
            const selectedGenre: string = searchResult[answer - 1];

            // TODO: search books by genre
            await this.searchForBookByGenre(selectedGenre);
        }
        else {
            Console.print("Ungültige Eingabe!");
        }
    }

    public async searchForBookByGenre(genre: string): Promise<void> {
        const searchResult: Book[] = this._books.filter((book: Book) => {
            return book.getGenre() == genre;
        });

        // sort by book title alphabetically
        searchResult.sort((_a: Book, _b: Book) => {
            const a = _a.getBookName().toLowerCase();
            const b = _b.getBookName().toLowerCase();

            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });

        const options: string[] = [];
        searchResult.forEach((book: Book, index) => {
            options.push(`${index + 1}: \"${book.getBookName()}\" von ${book.getAuthorsAsString()}`);
        });

        Console.print();
        Console.print(`Suchergebnisse für Genre \"${genre}\":`)
        let answer: number = Number.parseInt((await Console.showPossibilities(options, "Auswahl: ")).toString());

        if (!isNaN(answer) && answer > 0 && answer <= searchResult.length) {
            const selectedBook: Book = searchResult[answer - 1];
            this.printBookDetails(selectedBook);
        }
        else {
            Console.print("Ungültige Eingabe!");
        }
    }


    public async printBookDetails(book: Book): Promise<void> {
        Console.print();
        Console.print(`Titel:               ${book.getBookName()}`);
        Console.print(`Autor/en:            ${book.getAuthorsAsString()}`);
        Console.print(`Veröffentlicht am:   ${book.getReleaseDate()}`);
        Console.print(`Herausgeber:         ${book.getPublisher()}`);
        Console.print(`ISBN-13:             ${book.getISBN()}`);
        Console.print(`Rubrik:              ${book.getGenre()}`);
        Console.print(`Seitenzahl:          ${book.getPages()}`);
        Console.print();
        Console.print(`Bücher angesehen: ${++this._numBooksViewed}`);
        Console.print();
    }

    public async printAuthorDetails(author: Author): Promise<void> {

        const authorsBooks = this._books.filter((book: Book) => {
            let contains: boolean = false;

            for (const a of book.getAuthors()) {
                if (a.uuid == author.uuid) {
                    contains = true;
                    break;
                }
            }

            return contains;
        });

        Console.print();
        Console.print();
        Console.print();
        Console.print("##################");
        Console.print("# AUTORENDETAILS #");
        Console.print("##################");
        Console.print();

        Console.print(`Name:                                ${author.authorsName}`);
        Console.print(`Geburtsdatum:                        ${author.birthday}`);
        Console.print(`Geschlecht:                          ${author.gender}`);
        Console.print(`Anzahl der geschriebenen Bücher:     ${author.numberOfBooks}`);
        Console.print(`Weitere Bücher von diesem Autor: `);
        for (let i = 0; i < authorsBooks.length && i < 3; i++) {
            const book = authorsBooks[i];
            Console.print(`    ${i + 1}: ${book.getBookName()} (${book.getReleaseDate()})`);
        }

        Console.print();
    }

    public async createAuthor(): Promise<void> {
        Console.print();
        Console.print();
        Console.print();
        Console.print("###############");
        Console.print("# NEUER AUTOR #");
        Console.print("###############");
        Console.print();


        let authorName: String = "";
        let authorBirthday: String = "";
        let authorGender: String = "";

        // name
        let validName: boolean = false;
        const nameRegex = new RegExp(/^(?:(?:[A-Z]{1}[a-z]+) ?)+$/);
        do {
            let answer = await Console.question("Vor- und Nachname: ");
            if (nameRegex.test(answer.toString())) {
                authorName = answer;
                validName = true;
            }
            else {
                Console.print("Ungültiges Format.");
            }
        }
        while (!validName);


        // birthday
        let validBirthday: boolean = false;
        const dateRegex = new RegExp(/^(?:\d){2}\.(?:\d){2}\.(?:\d){4}$/);
        do {
            let answer = await Console.question("Geburtsdatum (DD.MM.YYYY): ");

            // only checking for correct format DD.MM.YYYY
            // invalid dates like 99.99.9999 would still be possible
            if (dateRegex.test(answer.toString())) {
                authorBirthday = answer;
                validBirthday = true;
            }
            else {
                Console.print("Ungültiges Format.");
            }
        }
        while (!validBirthday);


        // gender
        let validGender: boolean = false;
        do {
            const genderAnswer = await Console.showPossibilities([
                "1. Männlich",
                "2. Weiblich"
            ], "Geschlecht: ");

            if (genderAnswer == "1") {
                authorGender = "Männlich";
                validGender = true;
            }
            else if (genderAnswer == "2") {
                authorGender = "Weiblich";
                validGender = true;
            }
            else {
                Console.print("Ungültige Eingabe.");
            }
        }
        while (!validGender);

        const author: AuthorDAO = {
            name: authorName,
            birthday: authorBirthday,
            gender: authorGender,
            uuid: Uuid.generateUuidFromString(authorName.toString() + authorBirthday.toString())
        };
        if (this.addAuthor(new Author(author))) {
            this.saveDataToFiles(SaveOption.authors);
            Console.print(`Neuer Autor \"${author.name}\" (uuid: ${author.uuid}) erfolgreich angelegt.`);
        }
        else {
            Console.print(`Autor \"${author.name}\" (uuid: ${author.uuid}) existiert bereits.`);
        }
    }

    public async createBook(): Promise<void> {
        Console.print();
        Console.print();
        Console.print();
        Console.print("##############");
        Console.print("# NEUES BUCH #");
        Console.print("##############");
        Console.print();

        let bookName: String = "";
        let bookAuthors: any[] = [];
        let bookReleaseDate: String = "";
        let bookPublisher: String = "";
        let bookIsbn13: String = "";
        let bookGenre: String = "";
        let bookPages: Number = 0;

        // name
        bookName = await Console.question("Buchtitel: ");

        // authors
        let authorsChosen: boolean = false;
        const authorOptions = [];

        this._authors.forEach((a: Author, index) => {
            authorOptions.push(`${index + 1}: ${a.authorsName} (${a.birthday})`);
        });
        authorOptions.push("\n<Enter>: Keinen weiteren Autor hinzufügen");

        do {
            const answer = await Console.showPossibilities(authorOptions, "Autor hinzufügen: ");

            // pressed Enter, so answer is should be empty
            if (answer.trim() == "") {
                authorsChosen = true;
                continue;
            }

            if (!isNaN(Number.parseInt(answer.toString()))) {
                const idx = Number.parseInt(answer.toString()) - 1;
                if (idx >= 0 && idx < this._authors.length) {
                    const author = this._authors[idx];
                    const tmp = {
                        name: author.authorsName,
                        uuid: author.uuid
                    };
                    if (!bookAuthors.includes(tmp)) {
                        bookAuthors.push(tmp);
                    }
                    Console.print(`\nAktuell ausgewählt: ${bookAuthors.map(a => a.name).join(', ')}`);
                }
                else {
                    Console.print("Ungültige Eingabe!");
                }
            }
            else {
                Console.print("Ungültige Eingabe!");
            }
        }
        while (!authorsChosen || bookAuthors.length < 1);

        // release date
        let validDate: boolean = false;
        const dateRegex = new RegExp(/^(?:\d){2}\.(?:\d){2}\.(?:\d){4}$/);
        do {
            let answer = await Console.question("Veröffentlichungsdatum (DD.MM.YYYY): ");

            // only checking for correct format DD.MM.YYYY
            // invalid dates like 99.99.9999 would still be possible
            if (dateRegex.test(answer.toString())) {
                bookReleaseDate = answer;
                validDate = true;
            }
            else {
                Console.print("Ungültiges Format.");
            }
        }
        while (!validDate);

        // publisher
        bookPublisher = await Console.question("Verlag: ");

        // isbn
        let validISBN: boolean = false;
        const isbnRegex = new RegExp(/^(?:978|979)-[0-9]{10}$/);
        do {
            let answer = await Console.question("ISBN13: ");

            if (isbnRegex.test(answer.toString())) {
                bookIsbn13 = answer;
                validISBN = true;
            }
            else {
                Console.print("Ungültiges Format.");
            }
        }
        while (!validISBN);

        // genre
        let validGenre: boolean = false;
        const genreOptions: string[] = [];

        this._genres.forEach((g: string, index) => {
            genreOptions.push(`${index + 1}: ${g} `);
        });

        do {
            const answer = await Console.showPossibilities(genreOptions, "Genre auswählen: ");

            if (!isNaN(Number.parseInt(answer.toString()))) {
                const idx = Number.parseInt(answer.toString()) - 1;
                if (idx >= 0 && idx < this._genres.length) {
                    bookGenre = this._genres[idx];
                    validGenre = true;
                }
                else {
                    Console.print("Ungültige Eingabe!");
                }
            }
            else {
                Console.print("Ungültige Eingabe!");
            }
        }
        while (!validGenre);

        // pages
        let validAnswer: boolean = false;

        do {
            const answer = await Console.question("Seitenzahl: ");
            const value = Number.parseInt(answer.toString());
            if (!isNaN(value)) {
                bookPages = value;
                validAnswer = true;
            }
            else {
                Console.print("Ungültige Eingabe! Eingabe muss Zahl sein.");
            }
        }
        while (!validAnswer);

        
        const book: BookDAO = {
            book_name: bookName,
            release_date: bookReleaseDate,
            authors: bookAuthors,
            publisher: bookPublisher,
            isbn_13: bookIsbn13,
            genre: bookGenre,
            pages: bookPages
        };

        if (this.addBook(new Book(book))) {
            this.saveDataToFiles(SaveOption.books);
            Console.print(`Neues Buch \"${book.book_name}\" (ISBN13: ${book.isbn_13}) erfolgreich angelegt.`);
        }
        else {
            Console.print(`Autor \"${book.book_name}\" (ISBN13: ${book.isbn_13}) existiert bereits.`);
        }
    }

    public async createGenre(): Promise<void> {
        Console.print();
        Console.print();
        Console.print();
        Console.print("###############");
        Console.print("# NEUE RUBRIK #");
        Console.print("###############");
        Console.print();

        const newGenre: String = await Console.question("Genre/Rubrik: ");

        if (this.addGenre(newGenre.toString())) {
            this.saveDataToFiles(SaveOption.genres);
            Console.print(`Neue Rubrik \"${newGenre}\" erfolgreich angelegt.`);
        }
        else {
            Console.print(`Rubrik \"${newGenre}\" existiert bereits.`);
        }
    }

    private saveDataToFiles(option: SaveOption): void {
        const fileHandler = new FileHandler();

        let books: BookDAO[] = [];
        if (option === SaveOption.all || option === SaveOption.books) {
            books = [...this._books].map((book: Book) => {
                return {
                    book_name: book.getBookName(),
                    release_date: book.getReleaseDate(),
                    authors: book.getAuthors(),
                    publisher: book.getPublisher(),
                    isbn_13: book.getISBN(),
                    genre: book.getGenre(),
                    pages: book.getPages()
                };
            });
        }

        let authors: AuthorDAO[] = [];
        if (option === SaveOption.all || option === SaveOption.authors) {
            authors = [...this._authors].map((author: Author) => {
                return {
                    name: author.authorsName,
                    birthday: author.birthday,
                    gender: author.gender,
                    uuid: author.uuid
                };
            });
        }


        switch (option) {
            case SaveOption.books:
                fileHandler.writeFile(this.PATH_BOOKS, books);
                break;
            case SaveOption.authors:
                fileHandler.writeFile(this.PATH_AUTHORS, authors);
                break;
            case SaveOption.genres:
                fileHandler.writeFile(this.PATH_GENRES, this._genres);
                break;
            case SaveOption.all:
                fileHandler.writeFile(this.PATH_BOOKS, books);
                fileHandler.writeFile(this.PATH_AUTHORS, authors);
                fileHandler.writeFile(this.PATH_GENRES, this._genres);
                break;
            default:
                break;
        }
    }
}
export default BookDatabaseService.getInstance();