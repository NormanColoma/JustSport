/**
 * Created by Norman on 04/11/2015.
 */
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

describe('Sports', function(){
    var owner = {name: 'Norman', lname: 'Coloma García', email: 'ua.norman@mail.com', pass: 'adi2015', gender: 'male', role: "owner"};
    var user = {name: 'Pepe', lname: 'Pardo García', email: 'pepe@mail.com', pass: 'adi2015', gender: 'male'};
    var credentials = {
        "grant_type" : "password",
        "username" : "ua.norman@mail.com",
        "password" : "adi2015"
    };
    var token = "";
    var user_token = "";
    before('Setting database in a known state',function(done) {
        umzug.execute({
            migrations: ['20151022133423-create-user', '20151016205501-sport-migration'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151016205501-sport-migration','20151022133423-create-user']).then(function(){
                models.user.create(owner).then(function(){
                    models.user.create(user).then(function(){
                        done();
                    })
                })
            })
        });
    });

    it('Getting access token', function(done){
        supertest(app)
            .post('/api/oauth2/token').send(credentials)
            .expect(200).expect(function(res){
                assert(res.body.access_token);
                token = res.body.access_token;
            }).end(done);

    });

    it('Getting access token for user', function(done){
        supertest(app)
            .post('/api/oauth2/token').send({
                "grant_type" : "password",
                "username" : "pepe@mail.com",
                "password" : "adi2015"
            })
            .expect(200).expect(function(res){
                assert(res.body.access_token);
                user_token = res.body.access_token;
            }).end(done);

    });

    it('Creating sport that does not exist. Should return status 201', function(done){
        var sport = {name: 'Zumba'};
        supertest(app)
            .post('/api/sports/new').send(sport)
            .set('Authorization', 'Bearer '+token)
            .expect(201)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, 'Zumba');
                assert.equal(res.get('Location'), 'http://127.0.0.1:3000/api/sports/'+res.body.id);
            }).end(done);

    });

    it('Creating sport that already exists. Should return status 500, unique constraint error', function(done){
        var sport = {name: 'Zumba'};
        supertest(app)
            .post('/api/sports/new').send(sport)
            .set('Authorization', 'Bearer '+token)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, 'SequelizeUniqueConstraintError');
                assert.equal(res.body.errors[0].message, 'name must be unique');
            }).end(done);

    });

    it('Creating sport without access token. Should return status 401', function(done){
        var sport = {name: 'Zumba'};
        supertest(app)
            .post('/api/sports/new').send(sport)
            .expect(401)
            .end(done);
    });

    it('Creating sport without being owner. Should return status 403', function(done){
        var sport = {name: 'Zumba'};
        supertest(app)
            .post('/api/sports/new').send(sport)
            .set('Authorization', 'Bearer '+user_token)
            .expect(403)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.message, 'You are not authorized to perform this action');
            }).end(done);

    });

    after('Dropping database',function(done) {
        umzug.down(['20151022133423-create-user', '20151016205501-sport-migration']).then(function (migrations) {
            done();
        });
    });
});