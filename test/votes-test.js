/**
 * Created by Norman on 23/03/2016.
 */
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

describe('Votes', function() {
    this.timeout(15000);

    var user_token = "";
    var another_token = "";

    before('Setting database in a known state', function (done) {
        umzug.execute({
            migrations: ['20160315113959-create-commentary.js','20160323111436-create-vote','20151106004253-create-establishment', '20151022133423-create-user', '20160315113959-create-commentary'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151022133423-create-user', '20160311103832-add-img-user', '20151106004253-create-establishment',
                '20160323111436-create-vote', '20160315113959-create-commentary.js']).then(function (migrations) {
                done();
            });
        });
    });

    before('Filling database', function (done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder', '20151105165744-establishments-test-seeder'],
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

    it('Getting access token for user', function (done) {
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

    describe('Posting votes',function(){
        it('Should return status 201 when posting new vote', function(done){
            supertest(app)
                .post('/api/establishments/1/votes/new')
                .set('Authorization', 'Bearer '+user_token)
                .expect(201)
                .expect(function(res){
                    assert.equal(res.body.Vote.user, '8d75a3xa-767e-46f1-bc86-a46a0f103735');
                }).end(done);
        });

        it('Should return status 500 when trying to vote the same establishment', function(done){
            supertest(app)
                .post('/api/establishments/1/votes/new')
                .set('Authorization', 'Bearer '+user_token)
                .expect(500)
                .expect(function(res){
                    assert.equal(res.body.errors.length, 1);
                    assert.equal(res.body.errors[0].type, "Duplicated entry");
                    assert.equal(res.body.errors[0].field, "PRIMARY");
                    assert.equal(res.body.errors[0].message, "The value: '8d75a3xa-767e-46f1-bc86-a46a0f103735-1' is already taken");
                }).end(done);
        });

        it('Should return status 401 when trying to vote without token', function(done){
            supertest(app)
                .post('/api/establishments/1/votes/new')
                .expect(401).end(done);
        });

        it('Should return status 401 when trying to vote with empty token', function(done){
            supertest(app)
                .post('/api/establishments/1/votes/new')
                .set('Authorization', 'Bearer ')
                .expect(401).end(done);
        });

        it('Should return status 400 when trying to vote, passing string as id of establishment', function(done){
            supertest(app)
                .post('/api/establishments/string/votes/new')
                .set('Authorization', 'Bearer '+user_token)
                .expect(400)
                .expect(function(res){
                    assert.equal(res.body.message, 'The supplied id that specifies the establishment is not a numerical id');
                }).end(done);
        });

        it('Should return status 404 when trying to vote an establihsment that does not exist', function(done){
            supertest(app)
                .post('/api/establishments/105/votes/new')
                .set('Authorization', 'Bearer '+user_token)
                .expect(404)
                .expect(function(res){
                    assert.equal(res.body.message, 'The establishment was not found');
                }).end(done);
        });

    });

    describe('Getting all votes from establishment',function(){
        it('Should return status 201 when posting another vote', function(done){
            supertest(app)
                .post('/api/establishments/1/votes/new')
                .set('Authorization', 'Bearer '+another_token)
                .expect(201)
                .end(done);
        });

        it('Should return 2 votes from the 1 establishment in the collection', function(done){
            supertest(app)
                .get('/api/establishments/1')
                .set('x-apicache-bypass', 'true')
                .expect(200)
                .expect(function(res){
                    assert.equal(res.body.Votes.length, 2);
                })
                .end(done);
        });
    });
    after('Dropping database',function(done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder', '20151105165744-establishments-test-seeder'],
            method: 'down'
        }).then(function(mig){
            umzug.down(['20160315113959-create-commentary.js','20160323111436-create-vote','20151106004253-create-establishment',
                '20160311103832-add-img-user','20151022133423-create-user']).then(function (migrations) {
                done();
            });
        });
    });

});