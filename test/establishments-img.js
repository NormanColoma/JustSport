/**
 * Created by Norman on 08/03/2016.
 */
/**
 * Created by Norman on 04/11/2015.
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

describe.only('Img estab', function() {
    this.timeout(15000);
    var credentials = {
        "grant_type": "password",
        "username": "ua.norman@mail.com",
        "password": "adi2015"
    };
    var owner_token = "";
    var user_token = "";
    var another_owner_token = "";
    before('Setting database in a known state', function (done) {
        umzug.execute({
            migrations: ['20151106004253-create-establishment', '20151022133423-create-user', '20151016205501-sport-migration',
                '20151106004323-create-establishmentsport'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151022133423-create-user', '20151106004253-create-establishment', '20151016205501-sport-migration', '20151106004323-create-establishmentsport']).then(function (migrations) {
                done();
            });
        });
    });

    before('Filling database', function (done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder', '20151105165744-establishments-test-seeder', '20151106235642-sport-test-seeder', '' +
            '20151106235801-sportestablishment-test-seeder'],
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

    it('Should updload the img and return status 204', function(done){
        supertest(app).put('/api/establishments/1/new/image/')
            .set('Authorization', 'Bearer '+owner_token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','est_profile')
            .attach('est_profile', './test/test-images/img-1.jpg')
            .expect(204)
            .end(done);
    });

    it('Passing string as id of est, should return status 400',function(done){
        supertest(app).put('/api/establishments/string/new/image/')
            .set('Authorization', 'Bearer '+owner_token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','est_profile')
            .attach('est_profile', './test/test-images/img-1.jpg')
            .expect(400)
            .expect(function(res){
                assert.equal('The supplied id that specifies the establishment is not a numercial id', res.body.message);
            })
            .end(done);
    });


    it('Passing img with longer size than 500KB, should return status 500',function(done){
        supertest(app).put('/api/establishments/1/new/image/')
            .set('Authorization', 'Bearer '+owner_token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','est_profile')
            .attach('est_profile', './test/test-images/img-1.jpg')
            .expect(500)
            .expect(function(res){
                assert.equal('File size is too long', res.body.message);
            })
            .end(done);
    });

    it('Should return database down, status 500',function(done){
        sequelize.close();
        supertest(app).put('/api/establishments/1/new/image/')
            .set('Authorization', 'Bearer '+owner_token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','est_profile')
            .attach('est_profile', './test/test-images/img-1.jpg')
            .expect(500)
            .expect(function(res){
                assert.equal('Database is not running right now. Please try it back in few moments', res.body.errors[0].message);
            })
            .end(done);
    });

    it('Should return status 401, unauthorized. Triying to upload img without token', function(done){
        sequelize = new Sequelize(
            config.database,
            config.username,
            config.password,
            {logging: false}
        );
        supertest(app).put('/api/establishments/1/new/image/')
            .set('Content-Type', 'multipart/form-data')
            .field('name','est_profile')
            .attach('est_profile', './test/test-images/img-1.jpg')
            .expect(500)
            .expect(function(res){
                assert.equal('Database is not running right now. Please try it back in few moments', res.body.errors[0].message);
            })
            .end(done);
    });

    it('Should return status 403, forbbiden. Triying to upload img without owner token', function(done){
        supertest(app).put('/api/establishments/string/1/image/')
            .set('Authorization', 'Bearer '+user_token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','est_profile')
            .attach('est_profile', './test/test-images/img-1.jpg')
            .expect(403)
            .expect(function(res){
                assert.equal('You are not authorized to perform this action', res.body.errors[0].message);
            })
            .end(done);
    });

    it('Should return status 404, not found. Passing id of establishment that does not exist', function(done){
        supertest(app).put('/api/establishments/105/new/image/')
            .set('Authorization', 'Bearer '+owner_token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','est_profile')
            .attach('est_profile', './test/test-images/img-1.jpg')
            .expect(404)
            .expect(function(res){
                assert.equal('The establishment was not found', res.body.errors[0].message);
            })
            .end(done);
    });

    after('Dropping database',function(done) {
        seeder.execute({
            migrations: ['20151106235801-sportestablishment-test-seeder','20151106235642-sport-test-seeder','20151105165531-user-test-seeder',
                '20151105165744-establishments-test-seeder'],
            method: 'down'
        }).then(function(mig){
            umzug.down(['20151106004323-create-establishmentsport','20151106004253-create-establishment','20151016205501-sport-migration',
                '20151022133423-create-user']).then(function (migrations) {
                done();
            });
        });
    });
});