'use strict';
var owner_id = '8a74a3aa-757d-46f1-ba86-a56a0f107735';
var est1 = {name: 'Gym A Tope', desc: 'Gimnasio perfecto para realizar tus actividades deportivas.',
  city: 'San Vicente del Raspeig', province: 'Alicante', addr: 'Calle San Franciso nº15',
  phone: '965660327', website: 'http://wwww.gymatope.es', main_img:'atope.jpeg',owner: owner_id};
var est2 = {name: 'Gym Noray', desc: 'Gimnasio muy acondicionado y en perfecto estado.',
  city: 'Santa Pola', province: 'Alicante', addr: 'Calle Falsa nº34',
  phone: '965662347', website: 'http://wwww.noraygym.com', main_img:'noray.jpeg',owner: owner_id};
var est3 = {name: 'Más Sport', desc: 'Asociación deportiva con unas instalaciones increíbles.',
  city: 'Valencia', province: 'Valencia', addr: 'Calle Arco nº32',
  phone: '965663057', website: 'http://wwww.masport.es', main_img:'mas.jpeg',owner: owner_id};
var est4 = {name: 'Montemar', desc: 'Especializados en cursos y clases de ténis.',
  city: 'Alicante', province: 'Alicante', addr: 'Avenida Novelda Km 14',
  phone: '965662268', website: 'http://wwww.montemar.es', main_img:'montemar.jpeg',owner: owner_id};
var est5 = {name: 'Gimnasio 13', desc: 'El mejor lugar para ponerte en forma.',
  city: 'Barcelona', province: 'Barcelona', addr: 'Gran Vía nº15',
  phone: '965662257', website: 'http://wwww.13gym.es', main_img:'13gym.jpeg',owner: owner_id};

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('establishments',[est1,est2,est3,est4,est5]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('establishments', null, {});
  }
};
