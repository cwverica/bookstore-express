process.env.NODE_ENV = 'test'
const request = require("supertest");
const app = require("../app");
const db = require("../db");

const Book = require('../models/book')

let B1;
describe("Bookstore Test", function () {

    beforeEach(async function () {
        await db.query("DELETE FROM books");

        B1 = await Book.create({
            isbn: "0691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
        });
    });

    describe("GET /books/", function () {
        test("Returns one book in array", async function () {
            let response = await request(app)
                .get('/books/');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                books:
                    [{
                        ...B1
                    }]
            });
        });
    });

    describe("GET /books/:isbn", function () {
        test("Returns the one book in the db", async function () {
            let response = await request(app)
                .get(`/books/${B1.isbn}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                book:
                {
                    ...B1
                }
            });
        });

        test("Returns book not found", async function () {
            let response = await request(app)
                .get('books/1234567890');

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({
                "error": {
                    "message": "There is no book with an isbn '1234567890",
                    "status": 404
                },
                "message": "There is no book with an isbn '1234567890'"
            });
        });
    });

    describe("POST /books/", function () {
        test("can create a book", async function () {
            let response = await request(app)
                .post("/books/")
                .send({
                    "isbn": "0063081911",
                    "amazon_url": "https://www.amazon.com/American-Gods-Novel-Neil-Gaiman/dp/0063081911/",
                    "author": "Neil Gaiman",
                    "language": "english",
                    "pages": 560,
                    "publisher": "William Morrow Paperbacks",
                    "title": "American Gods",
                    "year": 2020
                });

            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual({
                "book": {
                    "isbn": "0063081911",
                    "amazon_url": "https://www.amazon.com/American-Gods-Novel-Neil-Gaiman/dp/0063081911/",
                    "author": "Neil Gaiman",
                    "language": "english",
                    "pages": 560,
                    "publisher": "William Morrow Paperbacks",
                    "title": "American Gods",
                    "year": 2020
                }
            });
        });

        test("Incomplete book", async function () {
            let response = await request(app)
                .post("/books/")
                .send({
                    "amazon_url": "https://www.amazon.com/American-Gods-Novel-Neil-Gaiman/dp/0063081911/",
                    "author": "Neil Gaiman",
                    "language": "english",
                    "pages": 560,
                    "publisher": "William Morrow Paperbacks",
                    "title": "American Gods",
                    "year": 2020
                });

            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                "error": {
                    "message": [
                        "instance requires property \"isbn\""
                    ],
                    "status": 400
                },
                "message": [
                    "instance requires property \"isbn\""
                ]
            })
        });
    });

    describe("PUT /books/:isbn", function () {
        test("Update book", async function () {
            let response = await request(app)
                .put(`/books/${B1.isbn}`)
                .send({
                    "isbn": `${B1.isbn}`,
                    "title": "Vijya Gaymez"
                });

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                "book": {
                    "isbn": "0691161518",
                    "amazon_url": "http://a.co/eobPtX2",
                    "author": "Matthew Lane",
                    "language": "english",
                    "pages": 264,
                    "publisher": "Princeton University Press",
                    "title": "Vijya Gaymez",
                    "year": 2017
                }
            });
        });

        test("Could not find book", async function () {
            let response = await request(app)
                .put(`/books/1234567890`)
                .send({
                    "isbn": "1234567890",
                    "title": "Vijya Gaymez"
                });

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({
                "error": {
                    "message": "There is no book with an isbn '1234567890'",
                    "status": 404
                },
                "message": "There is no book with an isbn '1234567890'"
            });
        });

        test("ISBN mismatch", async function () {
            let response = await request(app)
                .put(`/books/1234567890`)
                .send({
                    "isbn": "2134567890",
                    "title": "Vijya Gaymez"
                });

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({
                "error": {
                    "message": "ISBN does not match"
                },
                "message": "ISBN does not match"
            });
        });

    });

    describe("DELETE /books/:isbn", function () {
        test("Deletes book", async function () {
            let response = await request(app)
                .delete(`/books/${B1.isbn}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                "message": "Book deleted"
            })
        });

        test("Cannot find book", async function () {
            let response = await request(app)
                .delete(`/books/1234567890`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({
                "error": {
                    "message": "There is no book with an isbn '1234567890'",
                    "status": 404
                },
                "message": "There is no book with an isbn '1234567890'"
            });
        });
    });


});

afterAll(async function () {
    await db.end();
});