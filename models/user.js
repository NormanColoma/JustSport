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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is:{
          args: /^([ \u00c0-\u01ffa-zA-Z'\-])+$/i,
          msg: "name must only contain letters"
        },
        notEmpty:{
          msg: "name is required"
        }
      }
    },
    lname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is:{
          args: /^([ \u00c0-\u01ffa-zA-Z'\-])+$/i,
          msg: "lname must only contain letters"
        },
        notEmpty:{
          msg: "lname is required"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        isEmail:{msg: 'email is not valid, it must be like: youremail@domain.es'},
        notEmpty:{
          msg: "email is required"
        }
      }
    },
    pass:{
      type:  DataTypes.STRING,
      allowNull: false,
      validate:{
        is:{
          args: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/i,
          msg: 'pass is not valid. It must be at least 6 characters, no more than 15, and must include at least ' +
          'one lower case letter, and one numeric digit'
        },
        notEmpty:{
          msg: "pass is required"
        }
      }
    },
    gender: {
      type: DataTypes.STRING,
      validate:{
        isIn:{
          args: [['male', 'female']],
          msg: "gender must match 'male' or 'female' values"
        }
      }
    },
    role: {
      type: DataTypes.STRING,
      validate:{
        isIn:{
          args: [['user', 'owner']],
          msg: "role must match 'user' or 'owner' values"
        }
      }
    },
    img: {
      type: DataTypes.STRING,
    }
  }, {
    classMethods: {
      associate: function(models) {
        user.hasMany(models.vote,{as: 'Votes'})
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
      },
      isAdmin: function(token){
        var decodedToken = jwt.decode(token, global.secret);
        if(decodedToken.role === 'admin')
          return true;
        return false;
      },
      getAdminId: function (token) {
        var decodedToken = jwt.decode(token, global.secret);
        return decodedToken.sub;
      }
    },
    hooks: {
      beforeCreate: function (user, options, done){
        bcrypt.hash(user.pass, null, null, function(err, hash) {
          user.pass = hash;
          done();
        });
      }
    }
  });
  return user;
};