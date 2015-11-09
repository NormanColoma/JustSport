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
    var owner_id = '8b75a3aa-767e-46f1-ba86-a56a0f107738';
    var owner = {uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738', name: 'Norman', lname: 'Coloma García',
        email: 'ua.norman@mail.com', gender: 'male'}
    var est = {name: 'Gym A Tope', desc: 'Gimnasio perfecto para realizar tus actividades deportivas.',
        city: 'Alicante', province: 'San Vicente del Raspeig', addr: 'Calle San Franciso nº15',
        phone: '965660327', website: 'http://wwww.gymatope.es', main_img:'atope.jpeg',owner: owner_id};
    var sport = {id: 1,name: 'Spinning'};
    var course1 = {id: 1,sportId:'1', establishmentId:'1',instructor: 'Juan Domínguez',price:'17.50',info:'Un curso muy completo'};
    before('Setting database in a known state', function (done) {
        umzug.execute({
            migrations: ['20151108193656-create-course','20151106004323-create-establishmentsport','20151106004253-create-establishment',
                '20151022133423-create-user', '20151016205501-sport-migration'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151022133423-create-user', '20151106004253-create-establishment', '20151016205501-sport-migration',
                '20151106004323-create-establishmentsport', '20151108193656-create-course']).then(function (migrations) {

                done();
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

    it('Adding new course with a nonexistent establishment.Should return status 500',function(done){
        var nonexistent_est = {id: 1,sportId:'1', establishmentId:'25',instructor: 'Juan Domínguez',price:'17.50',info:'Un curso muy completo'};
        supertest(app)
            .post('/api/courses/new').send(nonexistent_est)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(500).expect(function(res){
                assert.equal(res.body.name, 'SequelizeForeignKeyConstraintError');
            }).end(done);
    })

    it('Adding new course with a nonexistent sport.Should return status 500',function(done){
        var nonexistent_sp = {id: 1,sportId:'150', establishmentId:'1',instructor: 'Juan Domínguez',price:'17.50',info:'Un curso muy completo'};
        supertest(app)
            .post('/api/courses/new').send(nonexistent_sp)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(500).expect(function(res){
                assert.equal(res.body.name, 'SequelizeForeignKeyConstraintError');
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