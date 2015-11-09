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
    var credentials = {"grant_type": "password", "username": "ua.norman@mail.com", "password": "adi2015"
    };
    var owner_token = "";
    var user_token = "";
    var another_owner_token = "";
    var owner_id = '8b75a3aa-767e-46f1-ba86-a56a0f107738';
    var owner = {uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738', name: 'Norman', lname: 'Coloma García',
        email: 'ua.norman@mail.com', gender: 'male'}
    var est = {id: 1,name: 'Gym A Tope', desc: 'Gimnasio perfecto para realizar tus actividades deportivas.',
        city: 'San Vicente del Raspeig', province: 'Alicante', addr: 'Calle San Franciso nº15',
        phone: '965660327', website: 'http://wwww.gymatope.es', main_img:'atope.jpeg',owner: owner_id};
    var sport = {id: 1,name: 'Spinning'};
    var course1 = {id: 1,sportId:'1', establishmentId:'1',instructor: 'Juan Domínguez',price:'17.50',info:'Un curso muy completo'};
    before('Setting database in a known state: Deleting', function (done) {
        umzug.execute({
            migrations: ['20151108193656-create-course','20151106004323-create-establishmentsport','20151106004253-create-establishment',
                '20151022133423-create-user', '20151016205501-sport-migration'],
            method: 'down'
        }).then(function (migrations) {
            done();
        })
    });

    before('Setting database in a known state: Creating', function (done) {
        umzug.up(['20151022133423-create-user', '20151106004253-create-establishment', '20151016205501-sport-migration',
            '20151106004323-create-establishmentsport', '20151108193656-create-course']).then(function (migrations) {
            done();
        })
    });

    before('Filling database', function (done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder', '20151105165744-establishments-test-seeder', '20151106235642-sport-test-seeder', '' +
            '20151109102627-sportestablishment-test-seeder2', '20151108194604-course-test-seeder'],
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

    it('Adding new course of sport that is imparted in the specified establishment.Should return status 201',function(done){
        supertest(app)
            .post('/api/courses/new').send(course1)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(201).expect(function(res){
                assert.equal(res.body.sportId, course1.sportId);
                assert.equal(res.body.establishmentId, course1.establishmentId);
                assert.equal(res.body.instructor, course1.instructor);
                assert.equal(res.body.price, course1.price);
                assert.equal(res.body.info, course1.info);
                assert.equal(res.get('Location'), 'http://127.0.0.1:3000/api/courses/'+res.body.id);
            }).end(done);
    })

    it('Adding new course of sport that is imparted in the specified establishment without access token.Should return status 401',function(done){
        supertest(app)
            .post('/api/courses/new').send(course1)
            .expect(401)
            .end(done);
    })

    it('Adding new course of sport that is imparted in the specified establishment without permisions.Should return status 403',function(done){
        supertest(app)
            .post('/api/courses/new').send(course1)
            .set('Authorization', 'Bearer '+user_token)
            .expect(403).expect(function(res){
                assert.equal(res.body.message, "You are not authorized to perform this action");
            }).end(done);
    })

    it('Adding new course without be a owner of any establishment. Should return status 403',function(done){
        supertest(app)
            .post('/api/courses/new').send(course1)
            .set('Authorization', 'Bearer '+another_owner_token)
            .expect(403).expect(function(res){
                assert.equal(res.body.message, 'You are not authorized to perform this action');
            }).end(done);
    })

    it('Adding new course with a nonexistent sport.Should return status 500',function(done){
        var nonexistent_sp = {id: 1,sportId:'150', establishmentId:'1',instructor: 'Juan Domínguez',price:'17.50',info:'Un curso muy completo'};
        supertest(app)
            .post('/api/courses/new').send(nonexistent_sp)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(500).expect(function(res){
                assert.equal(res.body.name, 'SequelizeUniqueConstraintError');
            }).end(done);
    })


    it('Adding new course with a malformed JSON.Should return status 400', function(done){
        var nonexistent_sp = {establishmentId:'1',instructor: 'Juan Domínguez',price:'17.50',info:'Un curso muy completo'};
        supertest(app)
            .post('/api/courses/new').send(nonexistent_sp)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(400).expect(function(res){
                assert.equal(res.body.message, 'Json is malformed, it must include the following fields: establishmentId,' +
                'sportId, instructor(optional), price, info(optional)');
            }).end(done);
    })

    it('Getting a course that exists. Should return status 200',function(done){
        supertest(app)
            .get('/api/courses/1')
            .expect(200).expect(function(res){
                assert.equal(JSON.stringify(res.body.Sport), JSON.stringify(sport));
                assert.equal(JSON.stringify(res.body.Establishment), JSON.stringify(est));
                assert.equal(res.body.info, course1.info);
                assert.equal(res.body.price, course1.price);
                assert.equal(res.body.instructor, course1.instructor);
            }).end(done);
    })

    it('Getting a course that does not exist. Should return status 404',function(done){
        supertest(app)
            .get('/api/courses/15')
            .expect(404).expect(function(res){
                assert.equal(res.body.message, 'The course was not found');
            }).end(done);
    })

    it('Getting a course passing id as string. Should return status 400',function(done){
        supertest(app)
            .get('/api/courses/Curso')
            .expect(400).expect(function(res){
                assert.equal(res.body.message, 'The supplied id that specifies the course is not a numercial id');
            }).end(done);
    })

    it('Updating a course that exists. Should return status 204', function(done){
        var update = {info: 'El curso está orientado para gente con un nivel alto en spinning'}
        supertest(app)
            .put('/api/courses/1').send(update)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(204)
            .end(done);
    })
    it('Checking the course after updated it (only info was changed). Should return status 200', function(done){
        supertest(app)
            .get('/api/courses/1')
            .expect(200).expect(function(res){
                assert.equal(JSON.stringify(res.body.Sport), JSON.stringify(sport));
                assert.equal(JSON.stringify(res.body.Establishment), JSON.stringify(est));
                assert.equal(res.body.info, 'El curso está orientado para gente con un nivel alto en spinning');
                assert.equal(res.body.price, course1.price);
                assert.equal(res.body.instructor, course1.instructor);
            }).end(done);
    })
    it('Updating a course passing id as string. Should return status 400', function(done){
        var update = {info: 'El curso está orientado para gente con un nivel alto en spinning.'}
        supertest(app)
            .put('/api/courses/Curso1').send(update)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(400).expect(function(res){
                assert.equal(res.body.message, 'The supplied id that specifies the course is not a numercial id');
            }).end(done);
    })

    it('Updating a course that does not exist. Should return status 404', function(done){
        var update = {info: 'El curso está orientado para gente con un nivel alto en spinning.'}
        supertest(app)
            .put('/api/courses/150').send(update)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(404).expect(function(res){
                assert.equal(res.body.message, 'The course was not found');
            }).end(done);
    })

    it('Updating a course without access token. Should return status 401', function(done){
        var update = {info: 'El curso está orientado para gente con un nivel alto en spinning.'}
        supertest(app)
            .put('/api/courses/1').send(update)
            .expect(401)
            .end(done);
    })

    it('Updating a course without permissions. Should return status 403', function(done){
        var update = {info: 'El curso está orientado para gente con un nivel alto en spinning.'}
        supertest(app)
            .put('/api/courses/1').send(update)
            .set('Authorization', 'Bearer '+user_token)
            .expect(403).expect(function(res){
                assert.equal(res.body.message, "You are not authorized to perform this action");
            }).end(done);
    })

    it('Updating a course without be the owner of establishment. Should return status 403', function(done){
        var update = {info: 'El curso está orientado para gente con un nivel alto en spinning.'}
        supertest(app)
            .put('/api/courses/1').send(update)
            .set('Authorization', 'Bearer '+another_owner_token)
            .expect(403).expect(function(res){
                assert.equal(res.body.message, "You are not authorized to perform this action");
            }).end(done);
    })

    it('Deleting a course without be the owner of the establishment. Should return status 403', function(done){
        supertest(app)
            .delete('/api/courses/1')
            .set('Authorization', 'Bearer '+another_owner_token)
            .expect(403).expect(function(res){
                assert.equal(res.body.message, "You are not authorized to perform this action");
            }).end(done);
    })

    it('Deleting a course without access token. Should return status 401', function(done){
        supertest(app)
            .delete('/api/courses/1')
            .expect(401)
            .end(done);
    })

    it('Deleting a course without owner token. Should return status 403', function(done){
        supertest(app)
            .delete('/api/courses/1')
            .set('Authorization', 'Bearer '+user_token)
            .expect(403).expect(function(res){
                assert.equal(res.body.message, "You are not authorized to perform this action");
            }).end(done);
    })

    it('Deleting a course passing id as string. Should return status 400', function(done){
        supertest(app)
            .delete('/api/courses/Curso')
            .set('Authorization', 'Bearer '+owner_token)
            .expect(400).expect(function(res){
                assert.equal(res.body.message, "The supplied id that specifies the course is not a numercial id");
            }).end(done);
    })

    it('Deleting a course that does not exist. Should return status 404', function(done){
        supertest(app)
            .delete('/api/courses/150')
            .set('Authorization', 'Bearer '+owner_token)
            .expect(404).expect(function(res){
                assert.equal(res.body.message, "The course was not found");
            }).end(done);
    })

    it('Deleting a course that exists. Should return status 204', function(done){
        supertest(app)
            .delete('/api/courses/1')
            .set('Authorization', 'Bearer '+owner_token)
            .expect(204)
            .end(done);
    })

    after('Dropping database',function(done) {
        seeder.execute({
            migrations: ['20151108194604-course-test-seeder','20151109102627-sportestablishment-test-seeder2','20151106235642-sport-test-seeder','20151105165531-user-test-seeder',
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