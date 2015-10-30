'use strict';

var bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: DataTypes.STRING,
    lname: DataTypes.STRING,
    email: DataTypes.STRING,
    pass: DataTypes.STRING,
    gender: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      verifyPassword: function(pass, hPass){
         return bcrypt.compareSync(pass, hPass);
      }
    },
    hooks: {
      beforeCreate: function (user, options, done){
        bcrypt.hash(user.pass, null, null, function(err, hash) {
          user.pass = hash;
          done();
        });
      },
      beforeUpdate:function (user, options, done){
        bcrypt.hash(user.pass, null, null, function(err, hash) {
          user.pass = hash;
          done();
        });
      }
    }
  });
  return user;
};