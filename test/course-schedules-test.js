/**
 * Created by Norman on 14/11/2015.
 */
/**
 * Created by Norman on 13/11/2015.
 */
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

describe('Schedule', function() {
    var credentials = {
        "grant_type": "password", "username": "ua.norman@mail.com", "password": "adi2015"
    };
    var owner_token = "";
    var user_token = "";
    var another_owner_token = "";
    var owner_id = '8b75a3aa-767e-46f1-ba86-a56a0f107738';
    before('Setting database in a known state: Deleting', function (done) {
        umzug.execute({
            migrations: ['20151113141451-create-schedule', '20151108193656-create-course', '20151106004323-create-establishmentsport', '20151106004253-create-establishment',
                '20151022133423-create-user', '20151016205501-sport-migration'],
            method: 'down'
        }).then(function (migrations) {
            done();
        })
    });

    before('Setting database in a known state: Creating', function (done) {
        umzug.execute({
            migrations: ['20151022133423-create-user', '20151106004253-create-establishment', '20151016205501-sport-migration',
                '20151106004323-create-establishmentsport', '20151108193656-create-course'],
            method: 'up'
        }).then(function (migrations) {
            umzug.up({migrations: ['20151113141451-create-schedule']});
            done();
        })
    });

    before('Filling database', function (done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder', '20151105165744-establishments-test-seeder', '20151106235642-sport-test-seeder', '' +
            '20151109102627-sportestablishment-test-seeder2', '20151108194604-course-test-seeder', '20151114114703-course-schedule-test-seeder'],
            method: 'up'
        }).then(function (mig) {
            done();
        })
    })

    it('Getting access token', function (done) {
        supertest(app)
            .post('/api/oauth2/token').send(credentials)
            .expect(200).expect(function (res) {
                assert(res.body.access_token);
                owner_token = res.body.access_token;
            }).end(done);

    });

    it('Getting access token for user', function (done) {
        supertest(app)
            .post('/api/oauth2/token').send({
                "grant_type": "password",
                "username": "pepe@mail.com",
                "password": "pepito15"
            })
            .expect(200).expect(function (res) {
                assert(res.body.access_token);
                user_token = res.body.access_token;
            }).end(done);

    });

    it('Getting access token for another owner that will not be the owner of establishments', function (done) {
        supertest(app)
            .post('/api/oauth2/token').send({
                "grant_type": "password",
                "username": "pepito@mail.com",
                "password": "pepin15"
            })
            .expect(200).expect(function (res) {
                assert(res.body.access_token);
                another_owner_token = res.body.access_token;
            }).end(done);

    });

    it('Getting schedule from a course that exists. Should return status 200', function(done){
        supertest(app)
            .get('/api/courses/1/schedule')
            .expect(200).expect(function (res) {
                assert(res.body.Schedule.length, 5);
            }).end(done);

    })

    it('Getting schedule from a course that does not exists. Should return status 404', function(done){
        supertest(app)
            .get('/api/courses/25/schedule')
            .expect(404).expect(function (res) {
                assert(res.body.message, 'The course was not found');
            }).end(done);

    })

    it('Getting schedule from a course passing id as string. Should return status 400', function(done){
        supertest(app)
            .get('/api/courses/curso/schedule')
            .expect(400).expect(function (res) {
                assert(res.body.message, 'The supplied id that specifies the course is not a numercial id');
            }).end(done);

    })


    after('Dropping database',function(done) {
        seeder.execute({
            migrations: ['20151114114703-course-schedule-test-seeder','20151108194604-course-test-seeder','20151109102627-sportestablishment-test-seeder2','20151106235642-sport-test-seeder','20151105165531-user-test-seeder',
                '20151105165744-establishments-test-seeder'],
            method: 'down'
        }).then(function(mig){
            umzug.down(['20151113141451-create-schedule','20151108193656-create-course','20151106004323-create-establishmentsport','20151106004253-create-establishment','20151016205501-sport-migration',
                '20151022133423-create-user']).then(function (migrations) {
                done();
            });
        })
    });
});