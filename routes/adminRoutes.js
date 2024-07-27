const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authenticationMiddleware');
const { isAdmin } = require ('../middleware/authorizationMiddleware');
const { createClassroom } = require('../controllers/adminController');
const { createAdmin, adminLogin, getAdminById, updateAdmin, deleteAdmin } = require('../controllers/adminController');

// Define admin routes here
router.post('/', verifyToken, isAdmin, createAdmin); // เส้นทางสำหรับการสร้างผู้ดูแลระบบใหม่
router.post('/login', adminLogin); // เส้นทางสำหรับการเข้าสู่ระบบของผู้ดูแลระบบ
router.get('/:id', verifyToken, isAdmin, getAdminById); // เส้นทางสำหรับการดึงข้อมูลของผู้ดูแลระบบโดยใช้ ID
router.put('/:id', verifyToken, isAdmin, updateAdmin); // เส้นทางสำหรับการอัปเดตข้อมูลของผู้ดูแลระบบ
router.delete('/:id', verifyToken, isAdmin, deleteAdmin); // เส้นทางสำหรับการลบผู้ดูแลระบบโดยใช้ ID
router.post('/classroom', createClassroom);

module.exports = router;
