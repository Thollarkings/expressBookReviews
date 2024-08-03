const express = require('express');
let books = require("./booksdb.js"); // Import the local book database
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Add new user to the users array
  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const bookList = await new Promise((resolve) => {
      resolve(books); // Resolve with the books data
    });
    res.json(bookList); // Sends the books object as JSON
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params; // Retrieve ISBN from the request parameters

  try {
    const bookDetails = await new Promise((resolve, reject) => {
      const book = books[isbn]; // Find the book by ISBN
      if (book) {
        resolve(book); // Resolve with the book details if found
      } else {
        reject(new Error("Book not found")); // Reject if not found
      }
    });
    res.json(bookDetails); // Return book details as JSON
  } catch (error) {
    console.error("Error fetching book details:", error);
    res.status(404).json({ message: error.message }); // Return 404 if book not found
  }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const { author } = req.params; // Retrieve author from the request parameters

  try {
    const results = await new Promise((resolve) => {
      const matchingBooks = []; // Array to hold matching books
      // Iterate through the books object
      for (let key in books) {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
          matchingBooks.push(books[key]); // Add matching books to results array
        }
      }
      resolve(matchingBooks); // Resolve with the matching books
    });

    if (results.length > 0) {
      res.json(results); // Return matching books as JSON
    } else {
      res.status(404).json({ message: "No books found for this author" }); // Handle case where no books are found
    }
  } catch (error) {
    console.error("Error fetching books by author:", error);
    res.status(500).json({ message: "Error fetching books by author" }); // Handle any other errors
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const { title } = req.params; // Get books title from the request parameters

  try {
    const results = await new Promise((resolve) => {
      const matchingBooks = []; // Array to hold matching books
      // Iterate through the books object
      for (let key in books) {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
          matchingBooks.push(books[key]); // Add matching books to results array
        }
      }
      resolve(matchingBooks); // Resolve with the matching books
    });

    if (results.length > 0) {
      res.json(results); // Return matching books as JSON
    } else {
      res.status(404).json({ message: "No books found with this title" }); // Handle case where no books are found
    }
  } catch (error) {
    console.error("Error fetching books by title:", error);
    res.status(500).json({ message: "Error fetching books by title" }); // Handle any other errors
  }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
  const { isbn } = req.params; // Retrieve ISBN from the request parameters
  const book = books[isbn]; // Find the book by ISBN

  if (book && book.reviews) {
    res.json(book.reviews); // Return reviews as JSON
  } else {
    res.status(404).json({ message: "Reviews not found for this book" }); // Handle case where reviews are not found
  }
});

module.exports.general = public_users;