import { BookDAO } from "../types/bookdao.type";
import { AbstractBook } from "./abstracts/AbstractBook";

export class Book extends AbstractBook {


    constructor(book: BookDAO) {
        super();
        this.setBookName(book.book_name);
        this.setReleaseDate(book.release_date);
        this.setAuthors(book.authors);
        this.setPublisher(book.publisher);
        this.setISBN(book.isbn_13);
        this.setGenre(book.genre);
        this.setPages(book.pages);
    }
}