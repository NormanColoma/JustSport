/**
 * Created by Norman on 10/03/2016.
 */
var supertest = require('supertest');
var assert  = require ('assert');
var models = require("../models");
var app = require('../app');
var Sequelize = require("sequelize");
var config = require("../config/config")[process.env.NODE_ENV];
var fs=require("fs");
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

describe('User Img Upload', function() {
    this.timeout(15000);
    var credentials = {
        "grant_type": "password",
        "username": "ua.norman@mail.com",
        "password": "adi2015"
    };
    var user1 = {name: 'Norman', lname: 'Coloma García', email: 'ua.norman@mail.com', pass: 'adi2015', gender: 'male'};
    var token = "";
    before('Setting database in a known state', function (done) {
        umzug.execute({
            migrations: ['20151022133423-create-user'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151022133423-create-user', '20160311103832-add-img-user']).then(function (mig) {
                done();
            });
        });
    });

    it('Creating user that does not exist already. Should return the posted user', function(done){
        supertest(app)
            .post('/api/users/new').send(user1)
            .expect(201)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.get('Location'), 'http://127.0.0.1:3000/api/users/'+res.body.uuid);
            }).end(done);

    });

    it('Getting access token', function(done){
        supertest(app)
            .post('/api/oauth2/token').send(credentials)
            .expect(200).expect(function(res){
            assert(res.body.access_token);
            token = res.body.access_token;
        }).end(done);

    });

    it('Should return status 204, when uploading jpg file <= 500KB', function(done){
        supertest(app).put('/api/users/me/profile/image/')
            .set('Authorization', 'Bearer '+token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','user_profile')
            .attach('user_profile', './test/test-images/img-1.jpg')
            .expect(204)
            .end(done);
    });

    it('Should return status 204, when uploading png file <= 500KB', function(done){
        supertest(app).put('/api/users/me/profile/image/')
            .set('Authorization', 'Bearer '+token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','user_profile')
            .attach('user_profile', './test/test-images/img-1.png')
            .expect(204)
            .end(done);
    });

    it('Should return status 401, when trying to upload image with empty token', function(done){
        supertest(app).put('/api/users/me/profile/image/')
            .set('Authorization', 'Bearer ')
            .expect(401)
            .end(done);
    });

    it('Should return status 500, when trying to upload image > 500KB', function(done){
        supertest(app).put('/api/users/me/profile/image/')
            .set('Authorization', 'Bearer '+token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','user_profile')
            .attach('user_profile', './test/test-images/bigger.jpeg')
            .expect(500).expect(function(res){
                assert.equal("File size is too long", res.body.message);
            }).end(done);
    });

    it('Should return status 404, when trying to upload image without attach it, function(done)', function(done){
        supertest(app).put('/api/users/me/profile/image/')
            .set('Authorization', 'Bearer '+token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','user_profile')
            .expect(404).expect(function(res){
                assert.equal("Image file was not found", res.body.message);
             }).end(done);
    });

    it('Should return status 400, when trying to upload image with different mime type than jpg/png', function(done){
        supertest(app).put('/api/users/me/profile/image/')
            .set('Authorization', 'Bearer '+token)
            .set('Content-Type', 'multipart/form-data')
            .field('name','user_profile')
            .attach('user_profile', './test/test-images/text.txt')
            .expect(400).expect(function(res){
                assert.equal("File must be jpg/png type", res.body.message);

            }).end(done);
    });

    after('Dropping database',function(done) {
        umzug.execute({
            migrations: ['20160311103832-add-img-user','20151022133423-create-user'],
            method: 'down'
        }).then(function (migrations) {
            fs.unlinkSync("./test/test-user-uploads/img-1.png");
            done();
        });
    });
});