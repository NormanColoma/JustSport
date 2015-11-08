/**
 * Created by Norman on 08/11/2015.
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

var seeder = new Umzug({
    migrations: {
        params: [ sequelize.getQueryInterface(), Sequelize ],
        path: "seeders/test"
    },
    storage: "sequelize",
    storageOptions: {
        sequelize: sequelize
    },
    logging: false
});

describe('Course', function() {
    var credentials = {
        "grant_type": "password",
        "username": "ua.norman@mail.com",
        "password": "adi2015"
    };
    var owner_token = "";
    var user_token = "";
    var owner_id = '8b75a3aa-767e-46f1-ba86-a56a0f107738';
    var id_gym_to_remove = "";
    var id_gym_to_update = "";
    var owner = {
        uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738',
        name: 'Norman',
        lname: 'Coloma García',
        email: 'ua.norman@mail.com',
        gender: 'male'
    }
    before('Setting database in a known state', function (done) {
        umzug.execute({
            migrations: ['20151108193656-create-course','20151106004323-create-establishmentsport','20151106004253-create-establishment',
                '20151022133423-create-user', '20151016205501-sport-migration'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151022133423-create-user', '20151106004253-create-establishment', '20151016205501-sport-migration',
                '20151106004323-create-establishmentsport', '20151108193656-create-course']).then(function (migrations) {
                done();
            }).catch(function(err){
                console.log(err);
            })
        })
    });

    before('Filling database', function (done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder', '20151105165744-establishments-test-seeder', '20151106235642-sport-test-seeder', '' +
            '20151106235801-sportestablishment-test-seeder'],
            method: 'up'
        }).then(function (mig) {
            done();
        })
    })

    it('Getting access token', function(done){
        supertest(app)
            .post('/api/oauth2/token').send(credentials)
            .expect(200).expect(function(res){
                assert(res.body.access_token);
                owner_token = res.body.access_token;
            }).end(done);

    });

    it('Getting access token for user', function(done){
        supertest(app)
            .post('/api/oauth2/token').send({
                "grant_type" : "password",
                "username" : "pepe@mail.com",
                "password" : "pepito15"
            })
            .expect(200).expect(function(res){
                assert(res.body.access_token);
                user_token = res.body.access_token;
            }).end(done);

    });

    xit('Adding new course of sport that is imparted in the specified establishment.Should return status 200',function(done){

    })



    after('Dropping database',function(done) {
        seeder.execute({
            migrations: ['20151106235801-sportestablishment-test-seeder','20151106235642-sport-test-seeder','20151105165531-user-test-seeder',
                '20151105165744-establishments-test-seeder'],
            method: 'down'
        }).then(function(mig){
            umzug.down(['20151108193656-create-course','20151106004323-create-establishmentsport','20151106004253-create-establishment','20151016205501-sport-migration',
                '20151022133423-create-user']).then(function (migrations) {
                done();
            });
        })
    });

});