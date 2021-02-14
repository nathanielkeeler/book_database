import { AuthorDAO } from "../types/authordao.type";

export class Author {
    private _authorsName: String;
    private _birthday: String;
    private _gender: String;
    private _uuid: String;
    private _numberOfBooks: Number;

    constructor(author: AuthorDAO) {
        this._authorsName = author.name;
        this._birthday = author.birthday;
        this._gender = author.gender;
        this._uuid = author.uuid;
        this._numberOfBooks = 0; // will be set later
    }

    public get authorsName(): String {
        return this._authorsName;
    }

    public set authorsName(value: String) {
        this._authorsName = value;
    }

    public get birthday(): String {
        return this._birthday;
    }

    public set birthday(value: String) {
        this._birthday = value;
    }

    public get gender(): String {
        return this._gender;
    }

    public set gender(value: String) {
        this._gender = value;
    }

    public get numberOfBooks(): Number {
        return this._numberOfBooks;
    }

    public set numberOfBooks(value: Number) {
        this._numberOfBooks = value;
    }

    public get uuid(): String {
        return this._uuid;
    }
}