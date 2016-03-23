'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('commentaries',[{
      id: 1,
      text: 'Primer comentario',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 2,
      text: 'Segundo comentario',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 3,
      text: 'Tercer comentario',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 4,
      text: 'Cuarto comentario',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 5,
      text: 'Quinto comentario',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 6,
      text: 'Sexto comentario',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 7,
      text: 'Septimo comentario',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 8,
      text: 'Octavo comentario',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 9,
      text: 'Noveno comentario',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 10,
      text: 'Décimo comentario',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 11,
      text: 'Comentario',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 12,
      text: 'Otro comentario',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 13,
      text: 'Otro nuevo comentario',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 14,
      text: 'Otra vez escribo aquí',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    },{
      id: 15,
      text: 'Otra vez comento',
      establishmentId: 1,
      user: '8d75a3xa-767e-46f1-bc86-a46a0f103735'
    }]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('commentaries', null, {});
  }
};
