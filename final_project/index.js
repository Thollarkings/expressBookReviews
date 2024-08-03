const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Session middleware
app.use(session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Authentication middleware for /customer/auth/* routes
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token
  
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
  
    jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
  
      req.username = decoded.username; // Attach username to request object
      next(); // Proceed to the next middleware or route handler
    });
});
  
// Use customer routes
app.use("/customer", customer_routes);

// Use general routes
app.use("/", genl_routes);

const PORT = 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));