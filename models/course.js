'use strict';
var models  = require('../models');

module.exports = function(sequelize, DataTypes) {
  var course = sequelize.define('course', {
    sportId: DataTypes.INTEGER,
    establishmentId: DataTypes.INTEGER,
    instructor: DataTypes.STRING,
    price: DataTypes.FLOAT,
    info: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
          course.belongsTo(models.sport, {foreignKey: 'id', as:'Sport'}),
          course.belongsTo(models.establishment, {foreignKey: 'id', as:'Establishment'})
      }
    }
  });
  return course;
};