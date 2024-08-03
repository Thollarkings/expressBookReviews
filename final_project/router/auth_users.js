const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid
const isValid = (username) => {
  return users.some(user => user.username === username);
}

// Check if username and password match
const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user ? user.password === password : false;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username exists and password matches
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Generate a JWT token
  const token = jwt.sign({ username }, process.env.JWT_SECRET || 'default_jwt_secret', { expiresIn: '1h' });

  return res.json({ token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.query;
  const { isbn } = req.params;
  const username = req.username; // Retrieve username from the request object

  // Check if the user is logged in
  if (!username) {
    return res.status(401).json({ message: "User must be logged in to post a review" });
  }

  // Validate the review and ISBN
  if (!review || !isbn) {
    return res.status(400).json({ message: "Review and ISBN are required" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update the review
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.username; // Retrieve username from the request object

  // Check if the user is logged in
  if (!username) {
    return res.status(401).json({ message: "User must be logged in to delete a review" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the review exists
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;