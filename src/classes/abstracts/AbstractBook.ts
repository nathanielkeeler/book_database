export class AbstractBook {

    private _bookName: String;
    private _releaseDate: String;
    private _authors: any[];
    private _publisher: String;
    private _isbn13: String;
    private _genre: String;
    private _pages: Number;

    constructor() {
        this._bookName = "";
        this._releaseDate = "";
        this._authors = [];
        this._publisher = "";
        this._isbn13 = "";
        this._genre = "";
        this._pages = 0;
    }

    public getBookName(): String {
        return this._bookName;
    }

    public setBookName(value: String) {
        this._bookName = value;
    }

    public getReleaseDate(): String {
        return this._releaseDate;
    }
    public setReleaseDate(value: String) {
        this._releaseDate = value;
    }

    public getAuthors(): any[] {
        return this._authors;
    }

    public setAuthors(value: any[]) {
        this._authors = value;
    }

    public getPublisher(): String {
        return this._publisher;
    }

    public setPublisher(value: String) {
        this._publisher = value;
    }

    public getISBN(): String {
        return this._isbn13;
    }

    public setISBN(value: String) {
        this._isbn13 = value;
    }

    public getGenre(): String {
        return this._genre;
    }

    public setGenre(value: String) {
        this._genre = value;
    }

    public getPages(): Number {
        return this._pages;
    }

    public setPages(value: Number) {
        this._pages = value;
    }

    public getAuthorsAsString(): string {
        return this._authors.map((author: any) => author.name).join(', ');
    }
}