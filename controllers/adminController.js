const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isAdminExists } = require('../utils/validation');
const { connectMySQL } = require('../utils/database');

const { Classroom, FieldOfStudy, Year } = require('../models');



module.exports.createAdmin = async (req, res) => {
  const data = req.body;

  try {
    const conn = await connectMySQL();

    const adminExists = await isAdminExists(data.username);
    if (adminExists) {
      return res.status(400).json({ error: 'The username already exists' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [result] = await conn.query(
      'INSERT INTO admin (username, password, role) VALUES (?, ?, "admin")',
      [data.username, hashedPassword]
    );

    const adminId = result.insertId;
    res.status(201).json({ message: 'ສ້າງຂໍ້ມູນຜູ້ດູແລລະບົບສຳເລັດ', adminId });
  } catch (error) {
    console.error('Error creating admin:', error.message, error.stack);
    res.status(500).json({ error: `An error occurred while creating the admin. ${error.message}` });
  }
};



// Function to login admin
// Function to login admin
// Function to login admin
// authController.js


module.exports.adminLogin = async (req, res, next) => {
  console.log(req.body);
  const { username, password } = req.body;
  try {
    // Connect to MySQL database
    const conn = await connectMySQL();

    // Query admin with the given username
    const [adminResult] = await conn.query('SELECT * FROM admin WHERE username = ?', [username]);

    // Check if the user is an admin
    const isAdmin = adminResult.length > 0;

    let user = null;
    let studentData = null;

    if (!isAdmin) {
      // Query student with the given sdCardID
      const [studentResult] = await conn.query('SELECT * FROM student WHERE sdCardID = ?', [username]);

      if (studentResult.length === 0) {
        return res.status(401).json({ error: 'ຊື່ຜູ້ດູແລລະບົບ ຫຼື ລະຫັດຜ່າບໍ່ຖືກຕ້ອງ' });
      }

      user = studentResult[0];
      studentData = user; // Store student data
    } else {
      user = adminResult[0];
    }

    // Check if password matches
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      const tokenPayload = {
        UserName: user.username,
        Role: isAdmin ? user.role : 'student',
      };

      if (!isAdmin) {
        tokenPayload.sdCardID = user.sdCardID;
      }

      const token = jwt.sign(tokenPayload, process.env.TOKEN_SECRET, { expiresIn: '1h' });

      // Return studentData along with other data
      return res.status(200).json({ message: 'ເຂົ້າສູ່ລະບົບສຳເລັດ', token, isAdmin, studentData });
    } else {
      return res.status(401).json({ error: 'ຊື່ຜູ້ດູແລລະບົບ ຫຼື ລະຫັດຜ່າບໍ່ຖືກຕ້ອງ' });
    }
  } catch (error) {
    console.error('ເກິດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບຂອງຜູ້ດູແລລະບົບ:', error.message);
    return res.status(500).json({ error: 'ເກິດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບຂອງຜູ້ດູແລລະບົບ' });
  }
};
// Function to get admin by ID
module.exports.getAdminById = async (req, res) => {
  const adminId = req.params.id;

  try {
    const conn = await connectMySQL();

    const [adminResult] = await conn.query('SELECT * FROM admin WHERE id = ?', [adminId]);

    if (adminResult.length === 0) {
      return res.status(404).json({ error: 'ບໍ່ມີຜູ້ດູແລລະບົບນີ້' });
    }

    const admin = adminResult[0];
    delete admin.Password;

    return res.json(admin);
  } catch (error) {
    console.error('Error fetching admin:', error.message);
    return res.status(500).json({ error: 'Error fetching admin' });
  }
};

// Function to update admin


module.exports.updateAdmin = async (req, res) => {
  const adminId = req.params.id; // `adminId` is expected to be the username
  const token = req.headers.authorization.split(' ')[1];

  try {
    // Verify the token and get the payload
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    // Check if the adminId from the token matches the adminId in the request
    if (decodedToken.UserName !== adminId) {
      return res.status(403).json({ error: 'Unauthorized to update this admin' });
    }

    const data = req.body;
    const updates = {};

    // Only allow updating username and password
    if (data.username) {
      updates.username = data.username;
    }

    if (data.password) {
      updates.password = await bcrypt.hash(data.password, 10);
    }

    const conn = await connectMySQL();

    const [result] = await conn.query('UPDATE admin SET ? WHERE username = ?', [updates, adminId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    return res.json({ message: 'Admin updated successfully', adminId });
  } catch (error) {
    console.error('Error updating admin:', error.message);
    return res.status(500).json({ error: 'Error updating admin' });
  }
};


// Function to delete admin
module.exports.deleteAdmin = async (req, res) => {
  const adminId = req.params.id;

  try {
    const conn = await connectMySQL();

    const [result] = await conn.query('DELETE FROM admin WHERE id = ?', [adminId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    return res.json({ message: 'ລົບຂໍ້ມູນຜູ້ດູແລລະບົບສຳເລັດ', adminId });
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການລົບຂໍ້ມູນຜູ້ດູແລລະບົບ:', error.message);
    return res.status(500).json({ error: 'Error deleting admin' });
  }
};


module.exports.createClassroom = async (req, res) => {
  const { field_of_study, year } = req.body;

  try {
    const field = await FieldOfStudy.findOne({ where: { name: field_of_study } });
    const yearEntry = await Year.findOne({ where: { number: year } });

    if (!field || !yearEntry) {
      return res.status(400).json({ error: 'Invalid field of study or year' });
    }

    const classroomName = `${field.name}${yearEntry.number}`;
    const classroom = await Classroom.create({
      name: classroomName,
      FieldOfStudyId: field.id,
      YearId: yearEntry.id
    });

    res.status(201).json(classroom);
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ error: 'An error occurred while creating the classroom' });
  }
};
