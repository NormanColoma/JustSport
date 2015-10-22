'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('establishments',[{
      name: 'Gym Prueba',
      desc: 'Un gimnasio muy bueno',
      province: 'Alicante',
      city: 'San Vicente del Raspeig',
      addr: 'Calle San Pablo nº 25'
    }, {
      name: 'Gym A Tope',
      desc: 'Un gimnasio demasiado bueno',
      province: 'Alicante',
      city: 'Alicante',
      addr: 'Calle Churruca nº 13'
    }]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('establishments', null, {});
  }
};