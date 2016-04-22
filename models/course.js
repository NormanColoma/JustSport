'use strict';
var models  = require('../models');

module.exports = function(sequelize, DataTypes) {
  var course = sequelize.define('course', {
    sportId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt:{
          msg: "sportId must be integer"
        },
        notEmpty:{
          msg: "sportId is required"
        }
      }
    },
    establishmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt:{
          msg: "establishmentId must be integer"
        },
        notEmpty:{
          msg: "establishmentId is required"
        }
      }
    },
    instructor: {
      type: DataTypes.STRING,
      validate: {
        is:{
          args: /^([ \u00c0-\u01ffa-zA-Z'\-])+$/i,
          msg: "instructor must only contain letters"
        }
      }
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat:{
          msg: "price must be float"
        },
        notEmpty:{
          msg: "price is required"
        }
      }
    },
    info: {
      type: DataTypes.TEXT,
    }
  }, {
    classMethods: {
      associate: function(models) {
          course.belongsTo(models.sport, {foreignKey: 'sportId', as:'Sport'}),
          course.belongsTo(models.establishment, {foreignKey: 'establishmentId', as:'Establishment'}),
          course.hasMany(models.schedule,{as: 'Schedule'})
      }
    }
  });
  return course;
};