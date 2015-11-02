var supertest = require('supertest');
var assert  = require ('assert')
var models = require("../models");
var app = require('../app');
var Sequelize = require("sequelize");
var config = require("../config/config")["test"];
var sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {logging: false} //Disable output from each time that sequelize is being fired
);
var Umzug = require('umzug');
var umzug = new Umzug({
    migrations: {
        params: [ sequelize.getQueryInterface(), Sequelize ],
        path: "migrations"
    },
    storage: "sequelize",
    storageOptions: {
        sequelize: sequelize
    },
    logging: false
});

describe('User', function(){
    before('Setting database in a know state',function(done) {
        umzug.down('20151022133423-create-user').then(function (migrations) {
            umzug.up('20151022133423-create-user').then(function(){
                done();
            });
        });
    });
    var user = {name: 'Norman', lname: 'Coloma García', email: 'ua.norman@mail.com', pass: 'adi2015', gender: 'male'};
    it('Creating user that does not exist alrady. Should return the posted user', function(done){
        supertest(app)
            .post('/api/users/new').send(user)
            .expect(201)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, 'Norman');
                assert.equal(res.body.lname, 'Coloma García');
                assert.equal(res.body.email, 'ua.norman@mail.com')
                assert.equal(res.body.gender, 'male');
                assert.equal(res.body.role, 'user')
                assert.equal(res.get('Location'), 'http://127.0.0.1:3000/api/users/'+res.body.uuid);
            }).end(done);

    });
    it('Creating user that already exists. Should return status 500, unique constrainr error', function(done){

        supertest(app)
            .post('/api/users/new').send(user)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, 'SequelizeUniqueConstraintError');
            }).end(done);
    });
    it('Deleting user that exists. Should return status 204', function(done){
        models.user.findOne({where : {email: 'ua.norman@mail.com'}, attributes: ['uuid']}).then(function(user){
            supertest(app)
                .delete('/api/users/'+user.uuid)
                .expect(204)
                .expect('Content-type', 'application/json; charset=utf-8')
                .end(done);
        })
    });
    it('Deleting user that doesn not exist. Should return status 404', function(done){
        supertest(app)
            .delete('/api/users/12345-45546')
            .expect(404)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.message, 'User was not found');
            }).end(done);
    });
});