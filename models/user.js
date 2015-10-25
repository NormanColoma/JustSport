'use strict';

var bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, Sequelize) {
  var user = sequelize.define('user', {
    name: Sequelize.STRING,
    lname: Sequelize.STRING,
    email: Sequelize.STRING,
    pass: Sequelize.STRING,
    gender: Sequelize.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    hooks: {
      beforeCreate: function (user){
        return bcrypt.hash(user.pass, null, null, function(err, hash) {
           user.pass = hash;
        });
      },
      beforeUpdate: function (user) {
        return bcrypt.hash(user.pass, null, null, function (err, hash) {
          user.pass = hash;
        });
      }
    }
  });
  return user;
};