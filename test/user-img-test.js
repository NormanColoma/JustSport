/**
 * Created by Norman on 10/03/2016.
 */
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

describe.only('User Img Upload', function() {
    this.timeout(15000);
    var credentials = {
        "grant_type": "password",
        "username": "ua.norman@mail.com",
        "password": "adi2015"
    };
    var token = "";
    var other_token="";
    before('Setting database in a known state', function (done) {
        umzug.execute({
            migrations: ['20151022133423-create-user'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up('20151022133423-create-user').then(function () {
                done();
            });
        });
    });

    before('Filling database', function (done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder'],
            method: 'up'
        }).then(function (mig) {
            done();
        });
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
            token = res.body.access_token;
        }).end(done);
    });

    it('Getting access token', function(done){
        supertest(app)
            .post('/api/oauth2/token').send(credentials)
            .expect(200).expect(function(res){
            assert(res.body.access_token);
            other_token = res.body.access_token;
        }).end(done);

    });

    it('Should return status 204, when uploading jpg file <= 500KB', function(done){
        supertest(app).put('/api/user/me/profile/image/')
            .set('Authorization', 'Bearer '+token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','user_profile')
            .attach('user_profile', './test/test-images/img-1.jpg')
            .expect(204)
            .end(done);
    });

    it('Should return status 204, when uploading png file <= 500KB', function(done){
        supertest(app).put('/api/user/me/profile/image/')
            .set('Authorization', 'Bearer '+token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','user_profile')
            .attach('user_profile', './test/test-images/img-1.png')
            .expect(204)
            .end(done);
    });

    it('Should return status 401, when trying to upload image with empty token', function(done){
        supertest(app).put('/api/user/me/profile/image/')
            .set('Authorization', 'Bearer ')
            .set('Content-Type', 'multipart/form-data')
            .field('name','user_profile')
            .attach('user_profile', './test/test-images/img-1.png')
            .expect(401)
            .end(done);
    });

    it('Should return status 403, when trying to upload image to another account', function(done){
        supertest(app).put('/api/user/me/profile/image/')
            .set('Authorization', 'Bearer '+other_token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','user_profile')
            .attach('user_profile', './test/test-images/img-1.png')
            .expect(403).expect(function(res){
                assert.equal("You are not authorized to perform this action", res.body.message);
            }).end(done);
    });

    it('Should return status 500, when trying to upload image > 500KB', function(done){
        supertest(app).put('/api/user/me/profile/image/')
            .set('Authorization', 'Bearer '+token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','user_profile')
            .attach('user_profile', './test/test-images/bigger.jpg')
            .expect(500).expect(function(res){
                assert.equal("File size is too long", res.body.message);
            }).end(done);
    });

    it('Should return status 404, when trying to upload image without attach it, function(done)', function(done){
        supertest(app).put('/api/user/me/profile/image/')
            .set('Authorization', 'Bearer '+token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','user_profile')
            .attach('user_profile', './test/test-images/text.txt')
            .expect(400).expect(function(res){
                assert.equal("File must be jpg/png type", res.body.message);
             }).end(done);
    });

    it('Should return status 400, when trying to upload image with different mime type than jpg/png', function(done){
        supertest(app).put('/api/user/me/profile/image/')
            .set('Authorization', 'Bearer '+token)
            .expect(400).expect(function(res){
            assert.equal("Image file was not found", res.body.message);
        }).end(done);
    });

    after('Dropping database',function(done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder'],
            method: 'down'
        }).then(function (mig) {
            umzug.down('20151022133423-create-user').then(function (migrations) {
                done();
            });
        });
    });
});