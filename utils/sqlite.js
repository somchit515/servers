const { Sequelize } = require('sequelize');

// ต่อ Sequelize กับฐานข้อมูล SQLite
const sequelize = new Sequelize({
  storage: './database.sqlite', // ตำแหน่งของไฟล์ SQLite database
  dialect: 'mysql',
  host: 'localhost',
  port: 3306, // เปลี่ยน port เป็น 3306 หรือ port ที่ MySQL ของคุณกำหนด
  username: 'root',
  password: '',
  database: 'e_student',
});

// ทดสอบเชื่อมต่อฐานข้อมูล
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// เรียกใช้ฟังก์ชันเพื่อทดสอบการเชื่อมต่อ
testConnection();

// ส่วนนี้คือการ export sequelize instance เพื่อให้นำไปใช้ใน models ต่าง ๆ
module.exports = sequelize;