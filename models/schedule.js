'use strict';
module.exports = function(sequelize, DataTypes) {
  var schedule = sequelize.define('schedule', {
    day: DataTypes.STRING,
    startTime: DataTypes.STRING,
    endTime: DataTypes.STRING,
    courseId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        schedule.belongsTo(models.course, {foreignKey: 'id', as:'Course'})
      }
    }
  });
  return schedule;
};