/**
 * Created by Norman on 15/03/2016.
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

describe('Establishments commentaries', function() {
    this.timeout(15000);

    var user_token = "";
    var another_token="";
    var commentary_1 = {text: "Primer comentario"};
    var commentary_2 = {text: "Segundo comentario"};
    var empty_commentary = {text:""};

    before('Setting database in a known state', function (done) {
        umzug.execute({
            migrations: ['20151106004253-create-establishment', '20151022133423-create-user', '20151016205501-sport-migration',
                '20151106004323-create-establishmentsport', '20160315113959-create-commentary'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151022133423-create-user', '20160311103832-add-img-user', '20151106004253-create-establishment', '20151016205501-sport-migration', '20151106004323-create-establishmentsport',
                '20160315113959-create-commentary']).then(function (migrations) {
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

    it('Should return status 201, when posting new commentary correctly', function(done){
        supertest(app)
            .post('/api/establishments/1/commentaries/new').send(commentary_1)
            .set('Authorization', 'Bearer '+user_token)
            .expect(201)
            .expect(function(res){
                assert.equal(res.body.Commentary.text, commentary_1.text);
                assert.equal(res.body.Commentary.user, '8d75a3xa-767e-46f1-bc86-a46a0f103735');
                assert.equal(res.get('Location'), 'http://127.0.0.1:3000/api/establishments/'+res.body.Commentary.establishmentId+"/commentaries/"+res.body.Commentary.id);
            }).end(done);

    });


    it('Should return status 401, when trying to post a new commentary with empty token', function(done){
        supertest(app)
            .post('/api/establishments/1/commentaries/new').send(commentary_1)
            .set('Authorization', 'Bearer ')
            .expect(401)
            .end(done);
    });

    it('Should return status 401, when trying to post a new commentary with invalid token', function(done){
        supertest(app)
            .post('/api/establishments/1/commentaries/new').send(commentary_1)
            .set('Authorization', 'Bearer 1234-5')
            .expect(401)
            .end(done);
    });

    it('Should return status 400, when not passing numerical id as id of establishment', function(done){
        supertest(app)
            .post('/api/establishments/string/commentaries/new').send(commentary_1)
            .set('Authorization', 'Bearer '+user_token)
            .expect(400).expect(function(res){
                assert.equal(res.body.message, "The supplied id that specifies the establishment is not a numercial id");
            })
            .end(done);
    });

    it('Should return status 404, when trying to post commentary to establishment that does not exist', function(done){
        supertest(app)
            .post('/api/establishments/105/commentaries/new').send(commentary_2)
            .set('Authorization', 'Bearer '+user_token)
            .expect(404).expect(function(res){
                assert.equal(res.body.message, "The establishment was not found");
            })
            .end(done);
    });

    it('Should return status 500, when trying to post commentary without text field', function(done){
        supertest(app)
            .post('/api/establishments/1/commentaries/new')
            .set('Authorization', 'Bearer '+user_token)
            .expect(500).expect(function(res){
                assert.equal(res.body.errors.length, 1);
                assert.equal(res.body.errors[0].type, "Missing field");
                assert.equal(res.body.errors[0].field, "text");
                assert.equal(res.body.errors[0].message, "text cannot be null");
            })
            .end(done);
    });

    it('Should return status 500, when trying to post empty commentary', function(done){
        supertest(app)
            .post('/api/establishments/1/commentaries/new').send({text:""})
            .set('Authorization', 'Bearer '+user_token)
            .expect(500).expect(function(res){
                assert.equal(res.body.errors.length, 2);
                assert.equal(res.body.errors[0].type, "Validation failed");
                assert.equal(res.body.errors[0].field, "text");
                assert.equal(res.body.errors[0].message, "text cannot be empty");
            })
            .end(done);
    });


    after('Dropping database',function(done) {
        seeder.execute({
            migrations: ['20151106235801-sportestablishment-test-seeder','20151106235642-sport-test-seeder','20151105165531-user-test-seeder',
                '20151105165744-establishments-test-seeder'],
            method: 'down'
        }).then(function(mig){
            umzug.down(['20160315113959-create-commentary','20151106004323-create-establishmentsport','20151106004253-create-establishment','20151016205501-sport-migration',
                '20160311103832-add-img-user','20151022133423-create-user']).then(function (migrations) {
                done();
            });
        });
    });
});