const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.KEY);
            if (decoded) {
                req.user = decoded; // Standardize
                req.body.labTechID = decoded.id;
                next();
            } else {
                res.status(401).send("Unauthorized: Invalid token.");
            }
        } catch (err) {
            res.status(401).send("Invalid or expired token.");
        }
    } else {
        res.status(403).send("Authorization header missing, Please login first.");
    }
};

module.exports = { authenticate };
