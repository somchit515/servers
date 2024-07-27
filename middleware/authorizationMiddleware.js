// middlewares/authorizationMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Secret_ = process.env.TOKEN_SECRET;
const multer = require("multer");
const upload = multer({
  dest: "uploads/", // ระบุโฟลเดอร์ปลายทางสำหรับไฟล์ที่อัปโหลด
  limits: {
    fileSize: 10 * 1024 * 1024, // เปลี่ยนขนาดสูงสุดของไฟล์ให้ไม่เกิน 10 MB (หน่วยเป็น bytes)
  },
});

// Authorization middleware function
module.exports.isAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    
    // ตรวจสอบว่ามี Token หรือไม่
    if (!token) {
      return res.status(403).json({ error: 'Access denied. No token provided.' });
    }
    
    // แยกส่วนของ Token
    const parts = token.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({ error: 'Token is in the incorrect format' });
    }
    
    const tokenValue = parts[1];
  
    // ตรวจสอบ Token
    const decoded = jwt.verify(tokenValue, Secret_);
  
    // ตรวจสอบว่าผู้ใช้เป็น Admin หรือไม่
    if (decoded.Role !== 'admin') {
      console.log(decoded.role);
      return res.status(403).json({ error: 'Access denied. Only admin allowed.' });
    }
  
    // ถ้าผู้ใช้เป็น Admin ให้เรียก middleware ถัดไป
    next();
    
  } catch (error) {
    // หากเกิดข้อผิดพลาดในการตรวจสอบ Token
    res.status(401).json({ error: 'Invalid token' });
  }
};



module.exports.isStudent = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    
    // ตรวจสอบว่ามี Token หรือไม่
    if (!token) {
      return res.status(403).json({ error: 'Access denied. No token provided.' });
    }
    
    // แยกส่วนของ Token
    const parts = token.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({ error: 'Token is in the incorrect format' });
    }
    
    const tokenValue = parts[1];
  
    // ตรวจสอบ Token
    const decoded = jwt.verify(tokenValue, Secret_);
  
    // ตรวจสอบว่าผู้ใช้เป็น Admin หรือไม่
    if (decoded.Role !== 'student') {
      console.log(decoded.role);
      return res.status(403).json({ error: 'Access denied. Only admin allowed.' });
    }
  
    // ถ้าผู้ใช้เป็น Admin ให้เรียก middleware ถัดไป
    next();
    
  } catch (error) {
    // หากเกิดข้อผิดพลาดในการตรวจสอบ Token
    res.status(401).json({ error: 'Invalid token' });
  }
};



