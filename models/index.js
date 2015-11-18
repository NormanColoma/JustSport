'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV  || 'production';
var config    = require('../config/config.json')[env];
var db        = {};

if(process.env.DATABASE_URL){
  /*var sequelize = new Sequelize(process.env.DATABASE_URL,{
    dialect: 'mysql',
    port: '3306',
    host: 'us-cdbr-iron-east-03.cleardb.net',
    logging: false
  });*/
  var sequelize = new Sequelize(config.database, config.username, config.password,{logging: false});
}
else if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable],{logging: false});
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password,{logging: false});
}

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    if (file.slice(-3) !== '.js') return;
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
