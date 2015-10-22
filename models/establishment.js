'use strict';
module.exports = function(sequelize, DataTypes) {
  var establishment = sequelize.define('establishment', {
    name: DataTypes.STRING,
    desc: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    addr: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        establishment.belongsToMany(models.sport, {through: 'establishmentsports'});
      }
    }
  });
  return establishment;
};