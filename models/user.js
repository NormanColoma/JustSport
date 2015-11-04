'use strict';

var bcrypt = require('bcrypt-nodejs');
var jwt = require('jwt-simple');

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
      },
      selfUser: function (token, user_id) {
        var decodedToken = jwt.decode(token, global.secret);
        if(decodedToken.sub === user_id) {
          return true;
        }
        return false;
      },
      isOwner: function(token){
        var decodedToken = jwt.decode(token, global.secret);
        if(decodedToken.role === 'owner')
          return true;
        return false;
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