// controllers/studentController.js
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { isSdCardIDExists, getUserIdByUsername } = require("../utils/validation");
const { connectMySQL } = require("../utils/database");
const { upload } = require("../middleware/fileUpload"); 
const multer = require('multer'); // Import multer if not already imported



module.exports.getStudents = async (req, res) => {
  try {
    const conn = await connectMySQL();
    let results = await conn.query("SELECT * FROM student");
    res.json(results[0]);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Error fetching students" });
  }
};


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ storage: storage });

module.exports.createStudent = async (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: "File upload error: " + err.message });
      } else {
        console.error("Unknown error during file upload:", err);
        return res.status(500).json({ error: "Error uploading file: " + err.message });
      }
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: "Please upload a file" });
      }

      const { sdCardID, created_by, updated_by, password, fname_la, lname_la, fname_en, lname_en, date_of_birth, date_start, date_end, field_of_study, year, phed, gender } = req.body;

      if (await isSdCardIDExists(sdCardID)) {
        return res.status(400).json({ error: "The sdCardID already exists" });
      }

      const createdById = await getUserIdByUsername(created_by);
      const updatedById = await getUserIdByUsername(updated_by);

      if (!createdById || !updatedById) {
        return res.status(400).json({ error: "Invalid created_by or updated_by value" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const conn = await connectMySQL();
      const [result] = await conn.query(
        "INSERT INTO student (sdCardID, fname_la, lname_la, fname_en, lname_en, date_of_birth, date_start, date_end, images, password, created_by, updated_by, field_of_study, year, phed, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          sdCardID, fname_la, lname_la, fname_en, lname_en, date_of_birth, date_start, date_end,
          req.file.filename, hashedPassword, createdById, updatedById, field_of_study, year, phed, gender
        ]
      );

      const studentId = result.insertId;
      res.status(201).json({ message: "Student created successfully", studentId });
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ error: "Error creating student: " + error.message });
    }
  });
};


// Function to get a student by sdCardID
module.exports.getStudentBysdCardID = async (req, res) => {
  const sdCardID = req.params.sdCardID;
  console.log(req.params.sdCardID);

  if (!sdCardID || typeof sdCardID !== "string") {
    return res.status(400).json({ error: "Invalid sdCardID" });
  }

  try {
    const conn = await connectMySQL();
    let [results] = await conn.query(
      "SELECT * FROM student WHERE sdCardID = ?",
      [sdCardID]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(results[0]);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ error: "Error fetching student" });
  }
};

// Function to update a student
module.exports.updateStudent = async (req, res) => {
  const sdCardID = req.params.sdCardID;
  const data = req.body;

  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const conn = await connectMySQL();
    const [existingStudent] = await conn.query(
      "SELECT * FROM student WHERE sdCardID = ?",
      [sdCardID]
    );

    if (existingStudent.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const newPassword = data.password;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateFields = Object.keys(data)
      .map((key) => `\`${key}\` = ?`)
      .join(", ");
    const updateValues = Object.values(data);

    const sql = `UPDATE student SET ${updateFields}, password = ? WHERE sdCardID = ?`;
    const values = [...updateValues, hashedPassword, sdCardID];
    const result = await conn.query(sql, values);

    if (result[0].affectedRows === 0) {
      return res.status(500).json({ error: "Failed to update student" });
    }

    res.json({ message: "Student updated successfully", sdCardID });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: "Error updating student" });
  }
};

// Function to delete a student
module.exports.deleteStudent = async (req, res) => {
  const id = req.params.id;

  try {
    const conn = await connectMySQL();
    const result = await conn.query("DELETE FROM student WHERE id = ?", [id]);
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ message: "Student deleted successfully", id });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ error: "Error deleting student" });
  }
};

// Function to get students by year and field of study
module.exports.getStudentsYear = async (req, res) => {
  try {
    const conn = await connectMySQL();
    const year = req.query.year;
    const field_of_study = req.query.field_of_study;

    const query = `
      SELECT * 
      FROM student 
      WHERE field_of_study = ? 
      AND year = ?
    `;
    const [results, _] = await conn.query(query, [field_of_study, year]);
    res.json(results);
  } catch (error) {
    console.error("Error fetching students by year and field:", error);
    res.status(500).json({ error: "Error fetching students by year and field" });
  }
};

// Function to search students by fname_la
module.exports.searchStudentsByFnameLa = async (req, res) => {
  try {
    const conn = await connectMySQL();
    const searchQuery = req.query.q;

    const query = `
      SELECT * 
      FROM student 
      WHERE fname_la LIKE ?
    `;
    const [results, _] = await conn.query(query, [`%${searchQuery}%`]);
    res.json(results);
  } catch (error) {
    console.error("Error searching students by fname_la:", error);
    res.status(500).json({ error: "Error searching students by fname_la" });
  }
};

// Function to get student data by token
module.exports.getStudentDataByToken = async (req, res) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decoded.userId;

    const conn = await connectMySQL();
    const [results] = await conn.query(
      "SELECT * FROM student WHERE id = ?",
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(results[0]);
  } catch (error) {
    console.error("Error fetching student data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
