const { DataTypes } = require('sequelize');
const sequelize = require('../utils/mysql');

const FieldOfStudyYear = sequelize.define('FieldOfStudyYear', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  field_of_study_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  year_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'field_of_study_year',
  timestamps: false
});

module.exports = FieldOfStudyYear;
