'use strict';
module.exports = function(sequelize, DataTypes) {
  var Course = sequelize.define('Course', {
    sportId: DataTypes.INTEGER,
    establishmentId: DataTypes.INTEGER,
    instructor: DataTypes.STRING,
    price: DataTypes.FLOAT,
    info: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
          establishment.belongsTo(models.sport, {foreignKey: 'id', as:'Sport'}),
          establishment.belongsTo(models.establishment, {foreignKey: 'id', as:'Establishment'})
      }
    }
  });
  return Course;
};