'use strict';
module.exports = function(sequelize, DataTypes) {
  var schedule = sequelize.define('schedule', {
    day: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        isIn:{
          args: [['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday']],
          msg: "day must match a valid day of week (it supports english and spanish days)"
        },
        notEmpty:{
          msg: "day is required"
        }
      }
    },
    startTime:  {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        is:{
          args: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
          msg: "startTime must match valid time: 12:00"
        },
        notEmpty:{
          msg: "startTime is required"
        }
      }
    },
    endTime:  {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        is:{
          args:  /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
          msg: "endTime must match valid time: 12:00"
        },
        notEmpty:{
          msg: "endTime is required"
        }
      }
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt:{
          msg: "courseId must be integer"
        },
        notEmpty:{
          msg: "courseId is required"
        }
      }
    },
  }, {
    classMethods: {
      associate: function(models) {
        schedule.belongsTo(models.course, {foreignKey: 'id', as:'Course'})
      }
    }
  });
  return schedule;
};