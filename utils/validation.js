// validation.js
const { connectMySQL } = require('./database');

// Check if SdCardID exists
module.exports.isSdCardIDExists = async (sdCardID) => {
  try {
    const conn = await connectMySQL();
    const [results] = await conn.query('SELECT * FROM student WHERE sdCardID = ?', [sdCardID]);
    return results.length > 0;
  } catch (error) {
    console.error('Error checking if SdCardID exists:', error.message);
    throw error;
  }
};

// Get user ID by username
module.exports.getUserIdByUsername = async (username) => {
  try {
    const conn = await connectMySQL(); // Connect to MySQL database

    // Query to get user ID by username
    const [results] = await conn.query('SELECT id FROM admin WHERE username = ?', [username]);
    
    // Check if any results were returned
    if (results.length === 0) {
      // If no results found, return null
      return null;
    } else {
      // If results found, return the user ID
      return results[0].id;
    }
  } catch (error) {
    // Handle errors
    console.error('Error getting user ID by username:', error.message);
    throw error;
  }
};


module.exports.isAdminExists = async (username) => {
  try {
    const conn = await connectMySQL();
    const [results] = await conn.query('SELECT COUNT(*) as count FROM admin WHERE username = ?', [username]);
    return results[0].count > 0; // Return true if admin exists, otherwise false
  } catch (error) {
    console.error('Error checking admin existence:', error.message);
    throw error;
  }
};