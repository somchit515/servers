const express = require('express');
const { verifyToken } = require('../middleware/authenticationMiddleware');
const { isAdmin } = require('../middleware/authorizationMiddleware');
const studentController = require('../controllers/studentController');

// Configure multer for handling file uploads
const { upload } = require('../middleware/fileUpload');

const router = express.Router();

router.post('/create', upload.single('file'), studentController.createStudent);

// Define student routes here
router.get('/', verifyToken, isAdmin, studentController.getStudents);
router.get('/studentsyear', verifyToken, isAdmin, studentController.getStudentsYear);
router.get('/search', verifyToken, isAdmin, studentController.searchStudentsByFnameLa);
router.post('/', upload.single('image'), studentController.createStudent); // Ensure file upload route is correct
router.get('/:sdCardID', verifyToken, isAdmin, studentController.getStudentBysdCardID);
router.put('/:sdCardID', verifyToken, isAdmin, studentController.updateStudent);
router.delete('/:id', verifyToken, isAdmin, studentController.deleteStudent);
router.get('/student', verifyToken, isAdmin, studentController.getStudentDataByToken); // API route to get student data by token

module.exports = router;
