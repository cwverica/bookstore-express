const express = require("express");
const Book = require("../models/book");
const ExpressError = require('../expressError');
const jsonschema = require('jsonschema');
const createBookSchema = require("../schemata/createBook.json");
const updateBookSchema = require('../schemata/updateBook.json');

const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  const result = await jsonschema.validate(req.body, createBookSchema);

  if (!result.valid) {
    let listOfErrors = result.errors.map(error => error.stack);
    let err = new ExpressError(listOfErrors, 400);
    return next(err);
  }
  const newBook = req.body;
  try {
    const book = await Book.create(newBook);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  const result = jsonschema.validate(req.body, updateBookSchema);

  if (!result.valid) {
    let listOfErrors = result.errors.map(error => error.stack);
    let err = new ExpressError(listOfErrors, 400);
    return next(err);
  }
  const updatedBook = req.body;
  try {
    if (updatedBook.isbn === req.params.isbn) {
      const book = await Book.update(updatedBook);
      return res.json({ book });
    }
    else return (new ExpressError("ISBN does not match"))
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
