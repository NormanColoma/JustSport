'use strict';
module.exports = function(sequelize, DataTypes) {
  var schedule = sequelize.define('schedule', {
    day: DataTypes.STRING,
    time: DataTypes.STRING,
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