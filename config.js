/** Common config for bookstore. */

require("dotenv").config();

const MY_DB_USER = process.env.MY_DB_USER;
const MY_DB_PW = process.env.MY_DB_PW;

let DB_URI = `postgresql://`;

if (MY_DB_USER) {
  if (process.env.NODE_ENV === "test") {
    DB_URI = `${DB_URI}${MY_DB_USER}:${MY_DB_PW}@localHost:5432/books-test`
  } else {
    DB_URI = `${DB_URI}${MY_DB_USER}:${MY_DB_PW}@localHost:5432/books`
  }
} else {
  if (process.env.NODE_ENV === "test") {
    DB_URI = `${DB_URI}/books-test`;
  } else {
    DB_URI = process.env.DATABASE_URL || `${DB_URI}/books`;
  }
}

module.exports = { DB_URI };