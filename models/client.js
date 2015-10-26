'use strict';
module.exports = function(sequelize, DataTypes) {
  var client = sequelize.define('client', {
    name: DataTypes.STRING,
    clientId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    clientSecret: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    userId: DataTypes.UUID
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });
  return client;
};