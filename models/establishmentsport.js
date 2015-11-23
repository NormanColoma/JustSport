'use strict';
module.exports = function(sequelize, DataTypes) {
    var estsports = sequelize.define('establishmentsports', {
        sportId: {
            allowNull: false,
            type: DataTypes.INTEGER,
            validate: {
                isInt:{
                    msg: "sportId must be integer"
                },
                notEmpty:{
                    msg: "sportId is required"
                }
            }
        },
        establishmentId: {
            allowNull: false,
            type: DataTypes.INTEGER,
            validate: {
                isInt:{
                    msg: "establishmentId must be integer"
                },
                notEmpty:{
                    msg: "establishmentId is required"
                }
            }
        },
        classMethods: {
            associate: function(models) {
            }
        }
    });
    return estsports;
};