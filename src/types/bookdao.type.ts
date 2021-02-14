export type _Author = {
    name: String,
    uuid: String
}

export type BookDAO = {
    book_name: String;
    release_date: String;
    authors: _Author[];
    publisher: String;
    isbn_13: String;
    genre: String;
    pages: Number;
}