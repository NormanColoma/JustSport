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

describe('EstablishmentsSports', function(){
    this.timeout(15000);
    var credentials = {
        "grant_type" : "password",
        "username" : "ua.norman@mail.com",
        "password" : "adi2015"
    };
    var owner_token = "";
    var user_token = "";
    var another_owner_token = "";
    var owner = {
        uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738',
        name: 'Norman',
        lname: 'Coloma García',
        email: 'ua.norman@mail.com',
        gender: 'male'
    };
    before('Setting database in a known state',function(done) {
        umzug.execute({
            migrations: ['20151106004253-create-establishment','20151022133423-create-user','20151016205501-sport-migration',
                '20151106004323-create-establishmentsport'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151022133423-create-user','20160311103832-add-img-user','20151106004253-create-establishment','20151016205501-sport-migration','20151106004323-create-establishmentsport']).then(function(migrations){
                done();
            });
        });
    });

    before('Filling database', function(done){
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder','20151105165744-establishments-test-seeder','20151106235642-sport-test-seeder', '' +
            '20151106235801-sportestablishment-test-seeder'],
            method: 'up'
        }).then(function(mig){
            done();
        });
    });

    it('Getting all establishments where the sport is imparted.Should return status 200', function(done){
        var owner = {uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738', name: 'Norman', lname: 'Coloma García',
            email: 'ua.norman@mail.com', gender: 'male'};
    var est1 = {id: 1,name: 'Gym A Tope', desc: 'Gimnasio perfecto para realizar tus actividades deportivas.',
        city: 'San Vicente del Raspeig', province: 'Alicante', addr: 'Calle San Franciso nº15',
        phone: '965660327', website: 'http://wwww.gymatope.es', main_img:'default.jpg', Owner: owner};
    var est2 = {id: 2,name: 'Gym Noray', desc: 'Gimnasio muy acondicionado y en perfecto estado.',
        city: 'Santa Pola', province: 'Alicante', addr: 'Calle Falsa nº34',
        phone: '965662347', website: 'http://wwww.noraygym.com', main_img:'default.jpg', Owner: owner};
    supertest(app)
        .get('/api/sports/1/establishments')
        .expect(200)
        .expect(function (res) {
            assert.equal(res.body.Establishments.rows.length, 2);
            assert.equal(JSON.stringify(res.body.Establishments.rows[0]), JSON.stringify(est1));
            assert.equal(JSON.stringify(res.body.Establishments.rows[1]), JSON.stringify(est2));
            assert.equal(res.body.paging.cursors.before, 0);
            assert.equal(res.body.paging.cursors.after, 0);
            assert.equal(res.body.paging.previous, 'none');
            assert.equal(res.body.paging.next, 'none');
        })
        .end(done);
});

it('Getting all establishments where the sport is imparted, which does not exists.Should return status 404', function(done){
    supertest(app)
        .get('/api/sports/15/establishments')
        .expect(404)
        .expect(function (res) {
            assert.equal(res.body.message, 'The sport was not found');
        })
        .end(done);
});
it('Getting all establishments where the sport is imparted, by passing the id as string.Should return status 400', function(done){
    supertest(app)
        .get('/api/sports/Zumba/establishments')
        .expect(400)
        .expect(function (res) {
            assert.equal(res.body.message, 'The supplied id that specifies the sport is not a numerical id');
        })
        .end(done);
});

it('Getting all establishments where the sport is imparted without specify cursor but limit.Should return status 200',
    function(done){
        var owner = {uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738', name: 'Norman', lname: 'Coloma García',
            email: 'ua.norman@mail.com', gender: 'male'};
        var est1 = {id: 1,name: 'Gym A Tope', desc: 'Gimnasio perfecto para realizar tus actividades deportivas.',
            city: 'San Vicente del Raspeig', province: 'Alicante', addr: 'Calle San Franciso nº15',
            phone: '965660327', website: 'http://wwww.gymatope.es', main_img:'default.jpg', Owner: owner};
        var est2 = {id: 2,name: 'Gym Noray', desc: 'Gimnasio muy acondicionado y en perfecto estado.',
            city: 'Santa Pola', province: 'Alicante', addr: 'Calle Falsa nº34',
            phone: '965662347', website: 'http://wwww.noraygym.com', main_img:'default.jpg', Owner: owner};
        supertest(app)
            .get('/api/sports/1/establishments?limit=2')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.Establishments.rows.length, 2);
                assert.equal(JSON.stringify(res.body.Establishments.rows[0]), JSON.stringify(est1));
                assert.equal(JSON.stringify(res.body.Establishments.rows[1]), JSON.stringify(est2));
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after, 0);
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'none');
            })
            .end(done);
    });

it('Getting all establishments where the sport is imparted specifying after cursor.Should return status 200',
    function(done){
        var owner = {uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738', name: 'Norman', lname: 'Coloma García',
            email: 'ua.norman@mail.com', gender: 'male'};
        var est2 = {id:2,name: 'Gym Noray', desc: 'Gimnasio muy acondicionado y en perfecto estado.',
            city: 'Santa Pola', province: 'Alicante', addr: 'Calle Falsa nº34',
            phone: '965662347', website: 'http://wwww.noraygym.com', main_img:'default.jpg', Owner: owner};
        var id = 1;
        var after = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/sports/1/establishments?after='+after+'&limit=1')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.Establishments.rows.length, 1);
                assert.equal(JSON.stringify(res.body.Establishments.rows[0]), JSON.stringify(est2));
                assert.equal(res.body.paging.cursors.before, new Buffer(res.body.Establishments.rows[0].id.toString()).toString('base64'));
                assert.equal(res.body.paging.cursors.after, 0);
                assert.equal(res.body.paging.previous, 'http://127.0.0.1:3000/api/sports/1/establishments?before='+
                    new Buffer(res.body.Establishments.rows[0].id.toString()).toString('base64')+'&limit=1');
                assert.equal(res.body.paging.next, 'none');
            })
            .end(done);
    });

it('Getting all establishments where the sport is imparted specifying before cursor.Should return status 200',
    function(done){
        var owner = {uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738', name: 'Norman', lname: 'Coloma García',
            email: 'ua.norman@mail.com', gender: 'male'};
        var est1 = {id:1,name: 'Gym A Tope', desc: 'Gimnasio perfecto para realizar tus actividades deportivas.',
            city: 'San Vicente del Raspeig', province: 'Alicante', addr: 'Calle San Franciso nº15',
            phone: '965660327', website: 'http://wwww.gymatope.es', main_img:'default.jpg', Owner: owner};
        var id = 2;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/sports/1/establishments?before='+before+'&limit=1')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.Establishments.rows.length, 1);
                assert.equal(JSON.stringify(res.body.Establishments.rows[0]), JSON.stringify(est1));
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after, new Buffer(res.body.Establishments.rows[0].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'http://127.0.0.1:3000/api/sports/1/establishments?after='+
                    new Buffer(res.body.Establishments.rows[0].id.toString()).toString('base64')+'&limit=1');
            })
            .end(done);
    });

it('Getting all establishments where the sport is imparted specifying cursor, but not limit.Should return status 400',
    function(done){
        var id = 1;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/sports/1/establishments?before='+before)
            .expect(400)
            .expect(function (res) {
                assert.equal(res.body.message, "Wrong parameters, limit parameter must be set for paging");
            })
            .end(done);
    });
it('Getting all establishments where the sport is imparted specifying cursor, and limit 0.Should return status 400',
    function(done){
        var id = 1;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/sports/1/establishments?before='+before+'&limit=0')
            .expect(400)
            .expect(function (res) {
                assert.equal(res.body.message, "The limit for pagination, must be greater than 0");
            })
            .end(done);
    });
    it('Getting all establishments where the sport, but got 0 recors.Should return status 404',
    function(done){
        var id = 1;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/sports/5/establishments?before='+before+'&limit=1')
            .expect(404)
            .expect(function (res) {
                assert.equal(res.body.message, "The are no sports added yet");
            })
            .end(done);
    });

    it('Getting all sports imparted in the establishment.Should return status 200', function(done){
        supertest(app)
            .get('/api/establishments/1/sports')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.Sports.rows.length, 3);
                assert.equal(res.body.Sports.rows[0].name, 'Spinning');
                assert.equal(res.body.Sports.rows[1].name, 'GAP');
                assert.equal(res.body.Sports.rows[2].name, 'Body Jump');
            })
            .end(done);
    });

    it('Getting all sports imparted in establishment that does not exist.Should return status 404', function(done){
        supertest(app)
            .get('/api/establishments/15/sports')
            .expect(404)
            .expect(function (res) {
                assert.equal(res.body.message, 'The establishment was not found');
            })
            .end(done);
    });

    it('Getting all sports imparted from establishment that is empty yet.Should return status 404', function(done){
        supertest(app)
            .get('/api/establishments/5/sports')
            .expect(404)
            .expect(function (res) {
                assert.equal(res.body.message, 'The are no sports added yet');
            })
            .end(done);
    });

    it('Getting all sports without specify cursor but limit. Should return status 200 and the first n sports set by the limit', function(done){
        supertest(app)
            .get('/api/establishments/1/sports?limit=1')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.Sports.rows.length, 1);
                assert.equal(res.body.Sports.rows[0].name, 'Spinning');
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body.Sports.rows[0].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next,
                    'http://127.0.0.1:3000/api/establishments/1/sports?after='+
                    new Buffer(res.body.Sports.rows[0].id.toString()).toString('base64')+'&limit=1');
            })
            .end(done);
    });
    it('Getting all sports without specify cursor but limit (0). Should return status 400', function(done){
        supertest(app)
            .get('/api/establishments/1/sports?limit=0')
            .expect(400)
            .expect(function (res) {
                assert.equal(res.body.message, "The limit for pagination, must be greater than 0");
            })
            .end(done);
    });

    it('Getting all sports specifying after cursor. Should return status 200 and the first n sports', function(done){
        var id = 1;
        var after = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/establishments/1/sports?after='+after+'&limit=2')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.Sports.rows.length, 2);
                assert.equal(res.body.Sports.rows[0].name, 'GAP');
                assert.equal(res.body.Sports.rows[1].name, 'Body Jump');
                assert.equal(res.body.paging.cursors.before,
                    new Buffer(res.body.Sports.rows[0].id.toString()).toString('base64'));
                assert.equal(res.body.paging.cursors.after, 0);
                assert.equal(res.body.paging.previous, 'http://127.0.0.1:3000/api/establishments/1/sports?before='+
                    new Buffer(res.body.Sports.rows[0].id.toString()).toString('base64')+'&limit=2');
                assert.equal(res.body.paging.next, 'none');
            })
            .end(done);
    });

    it('Getting all sports specifying before cursor. Should return status 200 and the first n sports', function(done){
        var id = 3;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/establishments/1/sports?before='+before+'&limit=2')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.Sports.rows.length, 2);
                assert.equal(res.body.Sports.rows[0].name, 'Spinning');
                assert.equal(res.body.Sports.rows[1].name, 'GAP');
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body.Sports.rows[1].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'http://127.0.0.1:3000/api/establishments/1/sports?after='+
                    new Buffer(res.body.Sports.rows[1].id.toString()).toString('base64')+'&limit=2');
            })
            .end(done);
    });


    it('Getting all sports specifying after cursor but not limit. Should return status 400', function(done){
        var id = 1;
        var after = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/establishments/1/sports?after='+after)
            .expect(400)
            .expect(function (res) {
                assert.equal(res.body.message, 'Wrong parameters, limit parameter must be set for paging');
            })
            .end(done);
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

    it('Associating new sport to establishment. Should return status 204', function(done){
        var sport = {name: 'GBody'};
        models.sport.create(sport).then(function(sp){
            var sport = {id: sp.id};
            supertest(app)
                .put('/api/establishments/1/sports/new').send(sport)
                .set('Authorization', 'Bearer '+owner_token)
                .expect(204)
                .end(done);
        });

    });

    it('Associating new sport (that does not exist) to establishment. Should return status 500', function(done){
        var sport = {id: 125};
        supertest(app)
            .put('/api/establishments/1/sports/new').send(sport)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(500)
            .expect(function (res) {
                assert.equal(res.body.errors[0].message, "The reference you are trying to set, " + "does not exist in our database");
            })
            .end(done);

    });

    it('Associating new sport to establishment (that does not exist). Should return status 404', function(done){
        var sport = {id: 125};
        supertest(app)
            .put('/api/establishments/25/sports/new').send(sport)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(404)
            .expect(function (res) {
                assert.equal(res.body.message, "The establishment was not found");
            })
            .end(done);

    });

    it('Associating new sport to establishment without owner token. Should return status 403', function(done){
        var sport = {id: 125};
        supertest(app)
            .put('/api/establishments/1/sports/new').send(sport)
            .set('Authorization', 'Bearer '+user_token)
            .expect(403)
            .expect(function (res) {
                assert.equal(res.body.message, "You are not authorized to perform this action");
            })
            .end(done);

    });

    it('Associating new sport to establishment without be the owner of it. Should return status 403', function(done){
        var sport = {id: 125};
        supertest(app)
            .put('/api/establishments/1/sports/new').send(sport)
            .set('Authorization', 'Bearer '+another_owner_token)
            .expect(403)
            .expect(function (res) {
                assert.equal(res.body.message, "You are not authorized to perform this action");
            })
            .end(done);

    });

    it('Associating new sport to establishment passing string as id of it. Should return status 400', function(done){
        var sport = {id: 125};
        supertest(app)
            .put('/api/establishments/gymatope/sports/new').send(sport)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(400)
            .expect(function (res) {
                assert.equal(res.body.message, "The supplied id that specifies the establishment is not a numerical id");
            })
            .end(done);

    });


    it('Associating new sport to establishment, without pass the sport. Should return status 400', function(done){
        var sport = {id: ' '};
        supertest(app)
            .put('/api/establishments/1/sports/new')
            .set('Authorization', 'Bearer '+owner_token)
            .expect(400)
            .expect(function (res) {
                assert.equal(res.body.message, "Json is malformed: id of sport must be included for perform this action");
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
                '20160311103832-add-img-user','20151022133423-create-user']).then(function (migrations) {
                done();
            });
        });
    });
});