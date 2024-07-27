// models/Year.js

const { DataTypes } = require('sequelize');
const sequelize = require('../utils/mysql'); // ต้องการให้ตรงกับการเชื่อมต่อ MySQL ที่ใช้งาน

const Year = sequelize.define('Year', {
  number: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'year' // กำหนดชื่อตารางให้ตรงกับที่มีในฐานข้อมูล MySQL
});

module.exports = Year;
