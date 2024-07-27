const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const { upload } = require('./middleware/fileUpload'); // Adjust the path if needed
const studentRoutes = require('./routes/studentRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const { connectMySQL } = require('./utils/database');
const { isSdCardIDExists, getUserIdByUsername } = require('./utils/validation');
const bcrypt = require('bcrypt'); // Import bcrypt

const app = express();

// Middleware and Configuration
app.use(compression());
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: 'http://192.168.205.62:8000',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
}));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Uploads directory created.');
} else {
  console.log('Uploads directory already exists.');
}

app.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    let conn; // Define the conn variable here
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

      conn = await connectMySQL();
      await conn.beginTransaction(); // Begin transaction

      const [result] = await conn.query(
        "INSERT INTO student (sdCardID, fname_la, lname_la, fname_en, lname_en, date_of_birth, date_start, date_end, images, password, created_by, updated_by,  phed, gender) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          sdCardID, fname_la, lname_la, fname_en, lname_en, date_of_birth, date_start, date_end,
          req.file.filename, hashedPassword, createdById, updatedById, phed, gender
        ]
      );

      const studentId = result.insertId;

      // Assuming field_of_study and year are handled separately, adjust as needed
      const [fieldResult] = await conn.query(
        "INSERT INTO field_of_study (name_field_of_study) VALUES (?) ON DUPLICATE KEY UPDATE name_field_of_study = VALUES(name_field_of_study)", 
        [field_of_study]
      );

      const [yearResult] = await conn.query(
        "INSERT INTO year (number) VALUES (?) ON DUPLICATE KEY UPDATE number = VALUES(number)", 
        [year]
      );

      await conn.commit(); // Commit transaction

      res.status(201).json({ message: "Student created successfully", studentId });
    } catch (error) {
      if (conn) {
        await conn.rollback(); // Rollback transaction on error
      }
      console.error("Error creating student:", error);
      res.status(500).json({ error: "Error creating student: " + error.message });
    } finally {
      if (conn) {
        conn.release(); // Ensure connection is released
      }
    }
  });
});

// Routes
app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);

// Start the server
app.listen(8000, () => {
  console.log('Server started on port 8000');
  connectMySQL(); // Ensure your database connection is established
});
