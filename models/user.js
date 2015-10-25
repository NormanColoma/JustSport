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