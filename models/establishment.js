'use strict';
module.exports = function(sequelize, DataTypes) {
  var establishment = sequelize.define('establishment', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is:{
          args: /^([ \u00c0-\u01ffa-zA-Z-0-9'\-])+$/i,
          msg: "name must only contain letters, numbers, and blank spaces. It cannot contain symbols"
        },
        notEmpty:{
          msg: "name is required"
        }
      }
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty:{
          msg: "desc is required"
        }
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is:{
          args: /^([ \u00c0-\u01ffa-zA-Z'\-])+$/i,
          msg: "city must only contain letters"
        },
        notEmpty:{
          msg: "city is required"
        }
      }
    },
    province:{
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn:{
          args: [['Albacete', 'Alicante', 'Almería', 'Álava', 'Asturias', 'Ávila', 'Badajoz','Islas Baleares', 'Barcelona',
            'Vizcaya', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ceuta', 'Ciudad Real', 'Córdoba', 'Coruña A', 'Cuenca',
            'Gipuzkoa', 'Girona', 'Granda', 'Guadalajara', 'Huelva', 'Huesca', 'Jaén','La Rioja','Las Palmas','León', 'Lleida', 'Lugo', 'Madrid',
            'Málaga', 'Melilla', 'Murcia','Navarra', 'Ourense', 'Palencia','Pontevedra','Salamanca', 'Santa Cruz de Tenerife', 'Segovia',
            'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Zamora', 'Zaragoza']],
          msg: 'province must match a existent spanish province'
        },
        notEmpty:{
          msg: "province is required"
        }
      }
    },
    addr: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty:{
          msg: "addr is required"
        }
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is:{
          args: /^[0-9]{2,3}-? ?[0-9]{6,7}$/,
          msg: "phone must be a valid spanish phone number"
        },
        notEmpty:{
          msg: "phone is required"
        }
      }
    },
    website: {
      type: DataTypes.STRING,
      validate: {
        isUrl:{
          msg: "website must be a valid link: http://foo.com"
        }
      }
    },
    main_img: {
      type: DataTypes.STRING,
      defaultValue: 'https://res.cloudinary.com/hgu1piqd2/image/upload/v1466335739/default-image_d2b3yh.jpg'
    },
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
        establishment.hasMany(models.course,{as: 'Courses'}),
        establishment.hasMany(models.commentary,{as: 'Commentaries'})
        establishment.hasMany(models.vote,{as: 'Votes'})
      }
    }
  });
  return establishment;
};