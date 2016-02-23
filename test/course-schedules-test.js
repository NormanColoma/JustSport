/**
 * Created by Norman on 14/11/2015.
 */
/**
 * Created by Norman on 13/11/2015.
 */
/**
 * Created by Norman on 08/11/2015.
 */
/*jshint -W069 */
var supertest = require('supertest');
var assert  = require ('assert');
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

xdescribe('Schedule of a course', function() {
    var credentials = {
        "grant_type": "password", "username": "ua.norman@mail.com", "password": "adi2015"
    };
    var owner_token = "";
    var user_token = "";
    var another_owner_token = "";
    var owner_id = '8b75a3aa-767e-46f1-ba86-a56a0f107738';
    var s1 = {id: 1, day: 'Martes', startTime: '10:00', endTime:"11:00"};
    var s2 = {id: 2, day: 'Lunes', startTime: '11:00', endTime:"12:00"};
    var s3 = {id: 3, day: 'Miércoles', startTime: '17:00', endTime:"18:00"};
    var s4 = {id: 4, day: 'Jueves', startTime: '12:00', endTime:"13:00"};
    var s5 = {id: 5, day: 'Jueves', startTime: '20:00', endTime:"21:00"};
    var s6 = {id: 6, day: 'Viernes', startTime: '09:00', endTime:"10:00"};
    var schedule = [];
    before('Setting database in a known state: Deleting', function (done) {
        umzug.execute({
            migrations: ['20151113141451-create-schedule', '20151108193656-create-course', '20151106004323-create-establishmentsport', '20151106004253-create-establishment',
                '20151022133423-create-user', '20151016205501-sport-migration'],
            method: 'down'
        }).then(function (migrations) {
            done();
        });
    });

    before('Setting database in a known state: Creating', function (done) {
        umzug.execute({
            migrations: ['20151022133423-create-user', '20151106004253-create-establishment', '20151016205501-sport-migration',
                '20151106004323-create-establishmentsport', '20151108193656-create-course'],
            method: 'up'
        }).then(function (migrations) {
            umzug.up({migrations: ['20151113141451-create-schedule']});
            done();
        });
    });

    before('Filling database', function (done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder', '20151105165744-establishments-test-seeder', '20151106235642-sport-test-seeder',
            '20151109102627-sportestablishment-test-seeder2', '20151108194604-course-test-seeder', '20151114114703-course-schedule-test-seeder'],
            method: 'up'
        }).then(function (mig) {
            done();
        });
    });

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
        schedule.push(s1,s2,s3,s4,s5);
        supertest(app)
            .get('/api/courses/1/schedule')
            .expect(200).expect(function (res) {
                assert(res.body.Schedule.rows.length, 5);
                assert.equal(JSON.stringify(res.body.Schedule.rows), JSON.stringify(schedule));
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body.Schedule.rows[4].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next,
                    'http://127.0.0.1:3000/api/courses/1/schedule?after='+
                    new Buffer(res.body.Schedule.rows[4].id.toString()).toString('base64')+'&limit=5');
            }).end(done);

    });

    it('Getting schedule from a course that exists, limiting rows. Should return status 200', function(done){
        schedule = [];
        schedule.push(s1,s2,s3);
        supertest(app)
            .get('/api/courses/1/schedule?limit=3')
            .expect(200).expect(function (res) {
                assert(res.body.Schedule.rows.length, 3);
                assert.equal(JSON.stringify(res.body.Schedule.rows), JSON.stringify(schedule));
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after, new Buffer(res.body.Schedule.rows[2].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'http://127.0.0.1:3000/api/courses/1/schedule?after='+
                    new Buffer(res.body.Schedule.rows[2].id.toString()).toString('base64')+'&limit=3');
            }).end(done);

    });

    it('Getting schedule from a course that exists, specifying after cursor. Should return status 200', function(done){
        schedule = [];
        schedule.push(s4,s5,s6);
        var id = 3;
        var after = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/courses/1/schedule?after='+after+"&limit=5")
            .expect(200).expect(function (res) {
                assert(res.body.Schedule.rows.length, 3);
                assert.equal(JSON.stringify(res.body.Schedule.rows), JSON.stringify(schedule));
                assert.equal(res.body.paging.cursors.before,  new Buffer(res.body.Schedule.rows[0].id.toString()).toString('base64'));
                assert.equal(res.body.paging.cursors.after, 0);
                assert.equal(res.body.paging.previous, 'http://127.0.0.1:3000/api/courses/1/schedule?before='+
                    new Buffer(res.body.Schedule.rows[0].id.toString()).toString('base64')+'&limit=5');
                assert.equal(res.body.paging.next, 'none');
            }).end(done);
    });

    it('Getting schedule from a course that exists, specifying before cursor. Should return status 200', function(done){
        schedule = [];
        schedule.push(s1,s2,s3);
        var id = 4;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/courses/1/schedule?before='+before+"&limit=5")
            .expect(200).expect(function (res) {
                assert(res.body.Schedule.rows.length, 3);
                assert.equal(JSON.stringify(res.body.Schedule.rows), JSON.stringify(schedule));
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after, new Buffer(res.body.Schedule.rows[2].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'http://127.0.0.1:3000/api/courses/1/schedule?after='+
                    new Buffer(res.body.Schedule.rows[2].id.toString()).toString('base64')+'&limit=5');
            }).end(done);
    });

    it('Getting schedule from a course that exists, specifying before cursor, but not limit. Should return status 400', function(done){
        schedule = [];
        schedule.push(s1,s2,s3);
        var id = 4;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/courses/1/schedule?before='+before)
            .expect(400).expect(function (res) {
                assert(res.body.message, "Wrong parameters, limit parameter must be set for paging");
            }).end(done);
    });

    it('Getting schedule from a course that exists, specifying after cursor, but not limit. Should return status 400', function(done){
        schedule = [];
        schedule.push(s1,s2,s3);
        var id = 4;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/courses/1/schedule?after='+after)
            .expect(400).expect(function (res) {
                assert(res.body.message, "Wrong parameters, limit parameter must be set for paging");
            }).end(done);
    });

    it('Getting schedule from a course that exists, limiting rows to 0. Should return status 400', function(done){
        supertest(app)
            .get('/api/courses/1/schedule?limit=0')
            .expect(400).expect(function (res) {
                assert(res.body.message, "The limit for pagination, must be greater than 0");
            }).end(done);

    });

    it('Getting schedule from a course that does not exists. Should return status 404', function(done){
        supertest(app)
            .get('/api/courses/25/schedule')
            .expect(404).expect(function (res) {
                assert(res.body.message, 'The course was not found');
            }).end(done);

    });

    it('Getting schedule from a course passing id as string. Should return status 400', function(done){
        supertest(app)
            .get('/api/courses/curso/schedule')
            .expect(400).expect(function (res) {
                assert(res.body.message, 'The supplied id that specifies the course is not a numercial id');
            }).end(done);

    });
    it('Getting schedule that is not established yet from a course that exists. Should return status 404', function(done){
        supertest(app)
            .get('/api/courses/3/schedule')
            .expect(404).expect(function (res) {
                assert(res.body.message, 'The are no schedules for this course');
            }).end(done);
    });

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
        });
    });
});