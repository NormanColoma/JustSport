'use strict';
module.exports = function(sequelize, DataTypes) {
  var token = sequelize.define('token', {
    token: DataTypes.STRING,
    userId: DataTypes.UUID,
    clientId: DataTypes.UUID
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return token;
};