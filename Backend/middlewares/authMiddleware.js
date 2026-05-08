const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Authentication Middleware: Verifies the JWT token
 */
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.KEY);
    req.user = decoded; // Contains id, role, name
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};

/**
 * Authorization Middleware: Checks if the user's role is permitted
 * @param {Array} allowedRoles - List of roles that can access the route
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Forbidden. You do not have permission to perform this action." 
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
