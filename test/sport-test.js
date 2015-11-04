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
    var user = {name: 'Norman', lname: 'Coloma García', email: 'ua.norman@mail.com', pass: 'adi2015', gender: 'male', role: "owner"};
    var credentials = {
        "grant_type" : "password",
        "username" : "ua.norman@mail.com",
        "password" : "adi2015"
    };
    var token = "";
    var user_id="";
    before('Setting database in a known state',function(done) {
        umzug.execute({
            migrations: ['20151022133423-create-user', '20151016205501-sport-migration'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151022133423-create-user', '20151016205501-sport-migration']).then(function(){
                models.user.create(user).then(function(user){
                    supertest(app)
                        .post('/api/oauth2/token').send(credentials)
                        .expect(200).expect(function(res){
                            assert(res.body.access_token);
                            token = res.body.access_token;
                            user_id = user.uuid;
                        }).end(done);
                });
            })
        });
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

            }).end(done);

    });

    after('Dropping database',function(done) {
        umzug.down(['20151022133423-create-user', '20151016205501-sport-migration']).then(function (migrations) {
            done();
        });
    });
});