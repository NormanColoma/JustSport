'use strict';
module.exports = function(sequelize, DataTypes) {
  var establishment = sequelize.define('establishment', {
    name: DataTypes.STRING,
    desc: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    addr: DataTypes.STRING,
    phone: DataTypes.STRING,
    website: DataTypes.STRING,
    main_img: DataTypes.STRING,
    owner: DataTypes.UUID,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
  }, {
    classMethods: {
      associate: function(models) {
        establishment.belongsToMany(models.sport, {through: 'establishmentsports'}),
        establishment.belongsTo(models.user, {foreignKey: 'owner', as:'Owner'}),
        establishment.hasMany(models.course,{through: 'Courses'})
      }
    }
  });
  return establishment;
};