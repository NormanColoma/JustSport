module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('establishmentsports',[{
      sportId: '1',
      establishmentId: '1'
    }, {
      sportId: '1',
      establishmentId: '2'
    },{
      sportId: '2',
      establishmentId: '2'
    },{
      sportId: '2',
      establishmentId: '1'
    },{
      sportId: '3',
      establishmentId: '1'
    },{
      sportId: '1',
      establishmentId: '4'
    }]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('establishmentsports', null, {});
  }
};
