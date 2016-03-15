'use strict';
module.exports = function(sequelize, DataTypes) {
  var commentary = sequelize.define('commentary', {
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        is:{
          args: /^([ \u00c0-\u01ffa-zA-Z-0-9'\-])+$/i,
          msg: "text cannot be empty"
        },
        notEmpty:{
          msg: "text is required"
        }
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    user: DataTypes.UUID,
    idEstab: DataTypes.INTEGER
    }, {
    classMethods: {
      associate: function(models) {
        commentary.belongsTo(models.user, {foreignKey: 'owner', as:'Owner'}),
        commentary.belongsTo(models.establishment, {foreignKey: 'id', as:'Establishment'})
      }
    }
  });
  return commentary;
};