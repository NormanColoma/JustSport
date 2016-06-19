'use strict';
var owner_id = '8a74a3aa-757d-46f1-ba86-a56a0f107735';
var est1 = {name: 'Gym A Tope', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod ' +
'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
'laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse ' +
'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia ' +
'deserunt mollit anim id est laborum',
  city: 'San Vicente del Raspeig', province: 'Alicante', addr: 'Calle San Franciso nº15',
  phone: '965660327', website: 'http://wwww.gymatope.es',owner: owner_id};
var est2 = {name: 'Gym Noray', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod ' +
'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
'laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse ' +
'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia ' +
'deserunt mollit anim id est laborum',
  city: 'Santa Pola', province: 'Alicante', addr: 'Calle Falsa nº34',
  phone: '965662347', website: 'http://wwww.noraygym.com', main_img:'gimnasios-privados3.jpg',owner: owner_id};
var est3 = {name: 'Más Sport', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod ' +
'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
'laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse ' +
'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia ' +
'deserunt mollit anim id est laborum',
  city: 'Valencia', province: 'Valencia', addr: 'Calle Arco nº32',
  phone: '965663057', website: 'http://wwww.masport.es',owner: owner_id};
var est4 = {name: 'Montemar', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod ' +
'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
'laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse ' +
'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia ' +
'deserunt mollit anim id est laborum',
  city: 'Alicante', province: 'Alicante', addr: 'Avenida Novelda Km 14',
  phone: '965662268', website: 'http://wwww.montemar.es',owner: owner_id};
var est5 = {name: 'Gimnasio 13', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod ' +
'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
'laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse ' +
'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia ' +
'deserunt mollit anim id est laborum',
  city: 'Barcelona', province: 'Barcelona', addr: 'Gran Vía nº15',
  phone: '965662257', website: 'http://wwww.13gym.es',owner: owner_id};

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('establishments',[est1,est2,est3,est4,est5]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('establishments', null, {});
  }
};
