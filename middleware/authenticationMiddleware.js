const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const Secret_ = process.env.TOKEN_SECRET;

// Middleware to verify JWT token
module.exports.verifyToken = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }
 
    const parts = req.headers.authorization.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({ error: 'Authorization header is in the incorrect format' });
    }
    
    const token = parts[1];
    const decoded = jwt.verify(token, Secret_);
    
    req.decoded = decoded;
    next();
   
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};


