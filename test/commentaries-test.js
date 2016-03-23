/**
 * Created by Norman on 22/03/2016.
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

describe('Commentaries', function() {
    this.timeout(15000);

    var user_token = "";
    var another_token = "";
    var commentary_1 = {text: "Primer comentario"};
    var commentary_2 = {text: "Segundo comentario"};
    var empty_commentary = {text: ""};

    before('Setting database in a known state', function (done) {
        umzug.execute({
            migrations: ['20151106004253-create-establishment', '20151022133423-create-user', '20160315113959-create-commentary'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151022133423-create-user', '20160311103832-add-img-user', '20151106004253-create-establishment',
                '20160315113959-create-commentary']).then(function (migrations) {
                done();
            });
        });
    });

    before('Filling database', function (done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder', '20151105165744-establishments-test-seeder','20160316105534-commentaries-test'],
            method: 'up'
        }).then(function (mig) {
            done();
        });
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

    it('Getting access token for another user', function (done) {
        supertest(app)
            .post('/api/oauth2/token').send({
                "grant_type": "password",
                "username": "ua.norman@mail.com",
                "password": "adi2015"
            })
            .expect(200).expect(function (res) {
            assert(res.body.access_token);
            another_token = res.body.access_token;
        }).end(done);

    });

    describe('Update commentaries', function(){
        it('Should return status 204, when trying to update a commentary', function(done){
            supertest(app).put('/api/commentaries/1').send({text:"El comentario ha cambiado"})
                .set('Authorization', 'Bearer '+user_token)
                .expect(204)
                .end(done);
        });


        it('Should return status 401, when trying to update a commentary without token', function(done){
            supertest(app).put('/api/commentaries/1').send({text:"Cambio otra vez"})
                .set('Authorization', '')
                .expect(401)
                .end(done);
        });

        it('Should return status 403, when trying to update a commentary with invalid token', function(done){
            supertest(app).put('/api/commentaries/1').send({text:"Cambio otra vez"})
                .set('Authorization', 'Bearer '+another_token)
                .expect(403).expect(function(res){
                    assert.equal("You are not authorized to perform this action", res.body.message);
                })
                .end(done);
        });

        it('Should return status 400, when trying to update a commentary when passing string as id of commentary', function(done){
            supertest(app).put('/api/commentaries/string').send({text:"Cambio otra vez"})
                .set('Authorization', 'Bearer '+another_token)
                .expect(400).expect(function(res){
                    assert.equal("The supplied id that specifies the commentary is not a numerical id", res.body.message);
                })
                .end(done);
        });


        it('Should return status 404, when trying to update a commentary that does not exist', function(done){
            supertest(app).put('/api/commentaries/103').send({text:"Cambio otra vez"})
                .set('Authorization', 'Bearer '+another_token)
                .expect(404).expect(function(res){
                    assert.equal("The commentary was not found", res.body.message);
                })
                .end(done);
        });

        it('Should return status 500, when trying to set commentary to empty', function(done){
            supertest(app).put('/api/commentaries/1').send({text:""})
                .set('Authorization', 'Bearer '+user_token)
                .expect(500).expect(function(res){
                    assert.equal(res.body.errors.length, 2);
                    assert.equal(res.body.errors[0].type, "Validation failed");
                    assert.equal(res.body.errors[0].field, "text");
                    assert.equal(res.body.errors[0].message, "text cannot be empty");
                })
                .end(done);
        });

        it('Should return status 500, when trying to set commentary to empty', function(done){
            supertest(app).put('/api/commentaries/1').send({text:null})
                .set('Authorization', 'Bearer '+user_token)
                .expect(500).expect(function(res){
                    assert.equal(res.body.errors.length, 1);
                    assert.equal(res.body.errors[0].type, "Missing field");
                    assert.equal(res.body.errors[0].field, "text");
                    assert.equal(res.body.errors[0].message, "text cannot be null");
                })
                .end(done);
        });
    });

    describe('Delete commentaries', function(){
        it('Should return status 204, when trying to delete a commentary', function(done){
            supertest(app).delete('/api/commentaries/1')
                .set('Authorization', 'Bearer '+user_token)
                .expect(204)
                .end(done);
        });


        it('Should return status 401, when trying to delete a commentary without token', function(done){
            supertest(app).delete('/api/commentaries/1')
                .set('Authorization', '')
                .expect(401)
                .end(done);
        });

        it('Should return status 403, when trying to delete a commentary with invalid token', function(done){
            supertest(app).delete('/api/commentaries/2')
                .set('Authorization', 'Bearer '+another_token)
                .expect(403).expect(function(res){
                    assert.equal("You are not authorized to perform this action", res.body.message);
                })
                .end(done);
        });

        it('Should return status 400, when trying to delete a commentary when passing string as id of commentary', function(done){
            supertest(app).delete('/api/commentaries/string')
                .set('Authorization', 'Bearer '+user_token)
                .expect(400).expect(function(res){
                    assert.equal("The supplied id that specifies the commentary is not a numerical id", res.body.message);
                })
                .end(done);
        });


        it('Should return status 404, when trying to delete a commentary that does not exist', function(done){
            supertest(app).delete('/api/commentaries/103')
                .set('Authorization', 'Bearer '+user_token)
                .expect(404).expect(function(res){
                    assert.equal("The commentary was not found", res.body.message);
                })
                .end(done);
        });
    });

    after('Dropping database',function(done) {
        seeder.execute({
            migrations: ['20160316105534-commentaries-test','20151105165531-user-test-seeder', '20151105165744-establishments-test-seeder'],
            method: 'down'
        }).then(function(mig){
            umzug.down(['20160315113959-create-commentary','20151106004253-create-establishment',
                '20160311103832-add-img-user','20151022133423-create-user']).then(function (migrations) {
                done();
            });
        });
    });
});