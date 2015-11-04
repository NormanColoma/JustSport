'use strict';
module.exports = function(sequelize, DataTypes) {
  var code = sequelize.define('code', {
    code: DataTypes.STRING,
    redirectUri: DataTypes.STRING,
    userId: DataTypes.UUID,
    clientId: DataTypes.UUID
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return code;
};