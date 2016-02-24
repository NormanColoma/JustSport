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
var config = require("../config/config")[process.env.NODE_ENV];
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
    this.timeout(15000);
    var credentials = {"grant_type": "password", "username": "ua.norman@mail.com", "password": "adi2015"
    };
    var owner_token = "";
    var user_token = "";
    var another_owner_token = "";
    var owner_id = '8b75a3aa-767e-46f1-ba86-a56a0f107738';
    var owner = {uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738', name: 'Norman', lname: 'Coloma García',
        email: 'ua.norman@mail.com', gender: 'male'};
    var est = {id: 1,name: 'Gym A Tope', desc: 'Gimnasio perfecto para realizar tus actividades deportivas.',
        city: 'San Vicente del Raspeig', province: 'Alicante', addr: 'Calle San Franciso nº15',
        phone: '965660327', website: 'http://wwww.gymatope.es', main_img:'atope.jpeg',owner: owner_id};
    var sport = {id: 1,name: 'Spinning'};
    var schedule = [{day: 'Thursday', startTime: "10:00", endTime:"11:00", courseId: 1},{day: 'Monday', time: '09:00-10:00', courseId: 1},
        {day: 'Friday', time: '17:00-18:00', courseId: 1}];
    before('Setting database in a known state: Deleting', function (done) {
        umzug.execute({
            migrations: ['20151113141451-create-schedule','20151108193656-create-course', '20151106004323-create-establishmentsport', '20151106004253-create-establishment',
                '20151022133423-create-user', '20151016205501-sport-migration'],
            method: 'down'
        }).then(function (migrations) {
            done();
        });
    });

    before('Setting database in a known state: Creating', function (done) {
        umzug.execute({
            migrations: ['20151022133423-create-user', '20151106004253-create-establishment', '20151016205501-sport-migration',
                '20151106004323-create-establishmentsport','20151108193656-create-course'],
            method: 'up'
        }).then(function (migrations) {
            umzug.up({ migrations: ['20151113141451-create-schedule'] });
            done();
        });
    });

    before('Filling database', function (done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder', '20151105165744-establishments-test-seeder', '20151106235642-sport-test-seeder', '' +
            '20151109102627-sportestablishment-test-seeder2', '20151108194604-course-test-seeder'],
            method: 'up'
        }).then(function (mig) {
            done();
        });
    });

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

    it('Getting access token for another owner that will not be the owner of establishments', function(done){
        supertest(app)
            .post('/api/oauth2/token').send({
                "grant_type" : "password",
                "username" : "pepito@mail.com",
                "password" : "pepin15"
            })
            .expect(200).expect(function(res){
                assert(res.body.access_token);
                another_owner_token = res.body.access_token;
            }).end(done);

    });

    it('Adding new schedule to an existent course. Should return status 201', function(done){
        supertest(app)
            .post('/api/schedules/new').send(schedule[0])
            .set('Authorization', 'Bearer '+owner_token)
            .expect(201).expect(function(res){
                assert.equal(res.body.day, schedule[0].day);
                assert.equal(res.body.startTime, schedule[0].startTime);
                assert.equal(res.body.endTime, schedule[0].endTime);
                assert.equal(res.body.courseId, schedule[0].courseId);
                assert.equal(res.get('Location'), 'http://127.0.0.1:3000/api/schedules/'+res.body.courseId);
            }).end(done);
    });

    it('Adding new schedule to a course that does not exist. Should return status 404', function(done){
        supertest(app)
            .post('/api/schedules/new').send(schedule)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(404).expect(function(res){
                assert.equal(res.body.message, "The course was not found");
            }).end(done);
    });

    it('Adding new schedule without access token. Should return status 401', function(done){
        supertest(app)
            .post('/api/schedules/new').send(schedule)
            .expect(401)
            .end(done);
    });

    it('Adding new schedule without owner token. Should return status 403', function(done){
        supertest(app)
            .post('/api/schedules/new').send(schedule[0])
            .set('Authorization', 'Bearer '+user_token)
            .expect(403).expect(function(res){
                assert.equal(res.body.message, "You are not authorized to perform this action");
            }).end(done);
    });

    it('Adding new schedule without be the owner of the establishment. Should return status 403', function(done){
        supertest(app)
            .post('/api/schedules/new').send(schedule[0])
            .set('Authorization', 'Bearer '+user_token)
            .expect(403).expect(function(res){
                assert.equal(res.body.message, "You are not authorized to perform this action");
            }).end(done);
    });

    it('Adding new schedule passing malformed JSON. Should return status 400', function(done){
        supertest(app)
            .post('/api/schedules/new').send(schedule[1])
            .set('Authorization', 'Bearer '+owner_token)
            .expect(400).expect(function(res){
                assert.equal(res.body.message, "Json is malformed, it must include the following fields: day," +
                    "startTime, endTime, courseId");
            }).end(done);
    });

    it('Adding new schedule passing invalid format. Should return status 500', function(done){
        var schedule= {day: 'Pepe', startTime: 'xx', endTime:"xx", courseId: 1};
        supertest(app)
            .post('/api/schedules/new').send(schedule)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(500).expect(function(res){
                assert.equal(res.body.errors.length, 3);
                assert.equal(res.body.errors[0].message, "day must match a valid day of week (it supports english and spanish days)");
                assert.equal(res.body.errors[1].message, "startTime must match valid time: 12:00");
                assert.equal(res.body.errors[2].message, "endTime must match valid time: 12:00");
            }).end(done);
    });

    it('Adding new schedule passing empty values. Should return status 500', function(done){
        var schedule= {day: ' ', startTime: ' ', endTime:' ', courseId: 1};
        supertest(app)
            .post('/api/schedules/new').send(schedule)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(500).expect(function(res){
                assert.equal(res.body.errors.length, 6);
                assert.equal(res.body.errors[0].message, "day must match a valid day of week (it supports english and spanish days)");
                assert.equal(res.body.errors[1].message, "day is required");
                assert.equal(res.body.errors[2].message, "startTime must match valid time: 12:00");
                assert.equal(res.body.errors[3].message, "startTime is required");
                assert.equal(res.body.errors[4].message, "endTime must match valid time: 12:00");
                assert.equal(res.body.errors[5].message, "endTime is required");
            }).end(done);
    });

    it('Updating a schedule that exists. Should return status 204', function(done){
        var update = {startTime: "12:00", endTime: "13:00", courseId: 1};
        supertest(app)
            .put('/api/schedules/1').send(update)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(204).end(done);
    });

    it('Checking schedule after updated it', function(done){
        models.schedule.findById(1).then(function(sched){
            assert.equal(sched.startTime, "12:00");
            assert.equal(sched.endTime, "13:00");
            done();
        });
    });

    it('Updating a schedule that does not exist. Should return status 404', function(done){
        var update = {startTime: "12:00", endTime: "13:00"};
        supertest(app)
            .put('/api/schedules/6').send(update)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(404).expect(function(res){
                assert.equal(res.body.message, "The course was not found");
            }).end(done);
    });

    it('Updating a schedule to a course that does not exists. Should return status 404', function(done){
        var update = {startTime: "12:00", endTime: "13:00", courseId: '15'};
        supertest(app)
            .put('/api/schedules/1').send(update)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(404).expect(function(res){
                assert.equal(res.body.message, "The course was not found");
            }).end(done);
    });

    it('Updating a schedule without access token. Should return status 401', function(done){
        var update = {startTime: "12:00", endTime: "13:00"};
        supertest(app)
            .put('/api/schedules/6').send(update)
            .expect(401)
            .end(done);
    });

    it('Updating a schedule without be owner. Should return status 403', function(done){
        var update = {startTime: "12:00", endTime: "13:00", courseId: '1'};
        supertest(app)
            .put('/api/schedules/1').send(update)
            .set('Authorization', 'Bearer '+user_token)
            .expect(403).expect(function(res){
                assert.equal(res.body.message, "You are not authorized to perform this action");
            }).end(done);
    });

    it('Updating a schedule without be a owner of the establishment. Should return status 403', function(done){
        var update = {startTime: "12:00", endTime: "13:00", courseId: '1'};
        supertest(app)
            .put('/api/schedules/1').send(update)
            .set('Authorization', 'Bearer '+another_owner_token)
            .expect(403).expect(function(res){
                assert.equal(res.body.message, "You are not authorized to perform this action");
            }).end(done);
    });

    it('Deleting a schedule that does not exist. Should return status 404', function(done){
        var deleted = {courseId: '1'};
        supertest(app)
            .delete('/api/schedules/2').send(deleted)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(404).expect(function(res){
                assert.equal(res.body.message, "The schedule was not found");
            }).end(done);
    });

    it('Deleting a schedule that exists but course not exists. Should return status 404', function(done){
        var deleted = {courseId: '15'};
        supertest(app)
            .delete('/api/schedules/1').send(deleted)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(404).expect(function(res){
                assert.equal(res.body.message, "The course was not found");
            }).end(done);
    });

    it('Deleting a schedule without be the owner of th establishment. Should return status 403', function(done){
        var deleted = {courseId: '1'};
        supertest(app)
            .delete('/api/schedules/1').send(deleted)
            .set('Authorization', 'Bearer '+another_owner_token)
            .expect(403).expect(function(res){
                assert.equal(res.body.message, "You are not authorized to perform this action");
            }).end(done);
    });

    it('Deleting a schedule passing id as string. Should return status 400', function(done){
        var deleted = {courseId: '1'};
        supertest(app)
            .delete('/api/schedules/horario').send(deleted)
            .set('Authorization', 'Bearer '+another_owner_token)
            .expect(400).expect(function(res){
                assert.equal(res.body.message, "The supplied id that specifies the schedule is not a numercial id");
            }).end(done);
    });

    it('Deleting a schedule that exist. Should return status 204', function(done){
        var deleted = {courseId: '1'};
        supertest(app)
            .delete('/api/schedules/1').send(deleted)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(204)
            .end(done);
    });

    after('Dropping database',function(done) {
        seeder.execute({
            migrations: ['20151108194604-course-test-seeder','20151109102627-sportestablishment-test-seeder2','20151106235642-sport-test-seeder','20151105165531-user-test-seeder',
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