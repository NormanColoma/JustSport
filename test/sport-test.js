/**
 * Created by Norman on 04/11/2015.
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

describe('Sports', function(){
    var owner = {name: 'Norman', lname: 'Coloma García', email: 'ua.norman@mail.com', pass: 'adi2015', gender: 'male', role: "owner"};
    var user = {name: 'Pepe', lname: 'Pardo García', email: 'pepe@mail.com', pass: 'adi2015', gender: 'male'};
    var admin = {name: 'Norman', lname: 'Coloma García', email: 'ua.norman@gmail.com', pass: 'admin2015', gender: 'male', role: "admin"}
    var credentials = {
        "grant_type" : "password",
        "username" : "ua.norman@mail.com",
        "password" : "adi2015"
    };
    var token = "";
    var user_token = "";
    var admin_token= "";
    before('Setting database in a known state',function(done) {
        umzug.execute({
            migrations: ['20151022133423-create-user', '20151016205501-sport-migration'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151016205501-sport-migration','20151022133423-create-user']).then(function(){
                models.user.create(owner).then(function(){
                    models.user.create(user).then(function(){
                        models.user.create(admin).then(function(){
                            done();
                        })
                    })
                })
            })
        });
    });

    it('Getting access token', function(done){
        supertest(app)
            .post('/api/oauth2/token').send(credentials)
            .expect(200).expect(function(res){
                assert(res.body.access_token);
                token = res.body.access_token;
            }).end(done);

    });

    it('Getting access token for user', function(done){
        supertest(app)
            .post('/api/oauth2/token').send({
                "grant_type" : "password",
                "username" : "pepe@mail.com",
                "password" : "adi2015"
            })
            .expect(200).expect(function(res){
                assert(res.body.access_token);
                user_token = res.body.access_token;
            }).end(done);

    });

    it('Getting access token for admin', function(done){
        supertest(app)
            .post('/api/oauth2/token').send({
                "grant_type" : "password",
                "username" : "ua.norman@gmail.com",
                "password" : "admin2015"
            })
            .expect(200).expect(function(res){
                assert(res.body.access_token);
                admin_token = res.body.access_token;
            }).end(done);

    });

    it('Creating sport that does not exist. Should return status 201', function(done){
        var sport = {name: 'Zumba'};
        supertest(app)
            .post('/api/sports/new').send(sport)
            .set('Authorization', 'Bearer '+token)
            .expect(201)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, 'Zumba');
                assert.equal(res.get('Location'), 'http://127.0.0.1:3000/api/sports/'+res.body.id);
            }).end(done);

    });

    it('Creating sport that already exists. Should return status 500, unique constraint error', function(done){
        var sport = {name: 'Zumba'};
        supertest(app)
            .post('/api/sports/new').send(sport)
            .set('Authorization', 'Bearer '+token)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, 'SequelizeUniqueConstraintError');
                assert.equal(res.body.errors[0].message, 'name must be unique');
            }).end(done);

    });

    it('Creating sport without access token. Should return status 401', function(done){
        var sport = {name: 'Zumba'};
        supertest(app)
            .post('/api/sports/new').send(sport)
            .expect(401)
            .end(done);
    });

    it('Creating sport without being owner. Should return status 403', function(done){
        var sport = {name: 'Zumba'};
        supertest(app)
            .post('/api/sports/new').send(sport)
            .set('Authorization', 'Bearer '+user_token)
            .expect(403)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.message, 'You are not authorized to perform this action');
            }).end(done);

    });

    it('Updating sport that exists. Should return status 204', function (done) {
        var sport = {name: 'Crossfit'};
        supertest(app)
            .put('/api/sports/1').send(sport)
            .set('Authorization', 'Bearer '+token)
            .expect(204)
            .end(done);
    })

    it('Updating sport that does not exist. Should return status 404', function (done) {
        var sport = {name: 'Crossfit'};
        supertest(app)
            .put('/api/sports/5').send(sport)
            .set('Authorization', 'Bearer '+token)
            .expect(404)
            .expect(function(res){
                assert.equal(res.body.message, 'The sport was not found');
            }).end(done);
    })

    it('Updating sport passing a string as id. Should return status 400', function (done) {
        var sport = {name: 'Crossfit'};
        supertest(app)
            .put('/api/sports/Zumba').send(sport)
            .set('Authorization', 'Bearer '+token)
            .expect(400)
            .expect(function(res){
                assert.equal(res.body.message, 'The supplied id that specifies the sport is not a numercial id');
            }).end(done);
    })


    it('Updating sport with a malformed JSON. Should return status 400', function (done) {
        var sport = {desc: 'Crossfit'};
        supertest(app)
            .put('/api/sports/1').send(sport)
            .set('Authorization', 'Bearer '+token)
            .expect(400)
            .expect(function (res) {
                assert.equal(res.body.message, 'Json is malformed, it must include the name field');
            })
            .end(done);
    })

    it('Updating sport whithout an access token. Should return status 401', function (done) {
        var sport = {name: 'Crossfit'};
        supertest(app)
            .put('/api/sports/1').send(sport)
            .expect(401)
            .end(done);
    })

    it('Updating sport without being owner. Should return status 403', function (done) {
        var sport = {name: 'Crossfit'};
        supertest(app)
            .put('/api/sports/1').send(sport)
            .set('Authorization', 'Bearer '+user_token)
            .expect(403)
            .expect(function (res) {
                assert.equal(res.body.message, 'You are not authorized to perform this action');
            })
            .end(done);
    })


    it('Deleting sport that exists. Should return status 204', function (done) {
        supertest(app)
            .delete('/api/sports/1')
            .set('Authorization', 'Bearer '+admin_token)
            .expect(204)
            .end(done);
    })

    it('Deleting sport that does not exist. Should return status 404', function (done) {
        supertest(app)
            .delete('/api/sports/3')
            .set('Authorization', 'Bearer '+admin_token)
            .expect(404)
            .expect(function (res) {
                assert.equal(res.body.message, 'The sport was not found');
            })
            .end(done);
    })

    it('Deleting sport without an access token. Should return status 401', function (done) {
        supertest(app)
            .delete('/api/sports/1')
            .expect(401)
            .end(done);
    })

    it('Deleting sport without being admin. Should return status 403', function (done) {
        supertest(app)
            .delete('/api/sports/1')
            .set('Authorization', 'Bearer '+token)
            .expect(403)
            .expect(function (res) {
                assert.equal(res.body.message, 'You are not authorized to perform this action');
            })
            .end(done);
    })

    it('Getting info about a sport that exists. Should return status 200', function(done){
        var sport = {name: 'Crossfit'};
        models.sport.create(sport).then(function(sport){
            supertest(app)
                .get('/api/sports/'+sport.id)
                .expect(200)
                .expect(function (res) {
                    assert.equal(res.body.name, 'Crossfit');
                    assert.equal(res.body.id, sport.id);
                })
                .end(done);
        })
    })

    it('Getting info about a sport that does not exist. Should return status 404', function(done){
        supertest(app)
            .get('/api/sports/15')
            .expect(404)
            .expect(function (res) {
                assert.equal(res.body.message, 'The sport was not found');
            })
            .end(done);
    })

    it('Getting info about a sport passing string as id. Should return status 400', function(done){
        supertest(app)
            .get('/api/sports/Crossfit')
            .expect(400)
            .expect(function (res) {
                assert.equal(res.body.message, 'The supplied id that specifies the sport is not a numercial id');
            })
            .end(done);
    })

    it('Getting sports without specify cursor. Should return status 200 and the first 5 sports', function(done){
        models.sport.bulkCreate([{name: 'Zumba'},{name:'Fitness'},{name: 'Aerobic'},
            {name: 'Spinning'}, {name: 'Step'}]).then(function(){
            supertest(app)
                .get('/api/sports')
                .expect(200)
                .expect(function (res) {
                    assert.equal(res.body.sports.length, 5);
                    assert.equal(res.body.sports[0].name, 'Crossfit');
                    assert.equal(res.body.sports[1].name, 'Zumba');
                    assert.equal(res.body.sports[2].name, 'Fitness');
                    assert.equal(res.body.sports[3].name, 'Aerobic');
                    assert.equal(res.body.sports[4].name, 'Spinning');
                    assert.equal(res.body.paging.cursors.before, 0);
                    assert.equal(res.body.paging.cursors.after,
                        new Buffer(res.body.sports[4].id.toString()).toString('base64'));
                    assert.equal(res.body.paging.previous, 'none');
                    assert.equal(res.body.paging.next,
                        'http://127.0.0.1:3000/api/sports?after='+
                        new Buffer(res.body.sports[4].id.toString()).toString('base64')+'&limit=5');
                })
                .end(done);
        })
    })


    it('Getting sports without specify cursor but limit. Should return status 200 and the first n sports', function(done){
        supertest(app)
            .get('/api/sports?limit=3')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.sports.length, 3);
                assert.equal(res.body.sports[0].name, 'Crossfit');
                assert.equal(res.body.sports[1].name, 'Zumba');
                assert.equal(res.body.sports[2].name, 'Fitness');
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body.sports[2].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next,
                    'http://127.0.0.1:3000/api/sports?after='+
                    new Buffer(res.body.sports[2].id.toString()).toString('base64')+'&limit=3');
            })
            .end(done);
    })

    it('Getting sports specifying after cursor. Should return status 200 and the first n sports', function(done){
        var id = 3;
        var after = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/sports?after='+after+'&limit=3')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.sports.length, 3);
                assert.equal(res.body.sports[0].name, 'Zumba');
                assert.equal(res.body.sports[1].name, 'Fitness');
                assert.equal(res.body.sports[2].name, 'Aerobic');
                assert.equal(res.body.paging.cursors.before, new Buffer(res.body.sports[0].id.toString()).toString('base64'));
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body.sports[2].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'http://127.0.0.1:3000/api/sports?before='+
                    new Buffer(res.body.sports[0].id.toString()).toString('base64')+'&limit=3');
                assert.equal(res.body.paging.next,
                    'http://127.0.0.1:3000/api/sports?after='+
                    new Buffer(res.body.sports[2].id.toString()).toString('base64')+'&limit=3');
            })
            .end(done);
    })

    it('Getting sports specifying before cursor. Should return status 200 and the first n sports', function(done){
        var id = 6;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/sports?before='+before+'&limit=3')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.sports.length, 3);
                assert.equal(res.body.sports[0].name, 'Crossfit');
                assert.equal(res.body.sports[1].name, 'Zumba');
                assert.equal(res.body.sports[2].name, 'Fitness');
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body.sports[2].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next,
                    'http://127.0.0.1:3000/api/sports?after='+
                    new Buffer(res.body.sports[2].id.toString()).toString('base64')+'&limit=3');
            })
            .end(done);
    })

    it('Getting all establishments where the sport is imparted.Should return status 200', function(done){
        var est1 = {name: 'Gym A Tope', desc: 'Gimnasio perfecto para realizar tus actividades deportivas.',
            city: 'Alicante', province: 'San Vicente del Raspeig', addr: 'Calle San Franciso nº15',
            phone: '965660327', website: 'http://wwww.gymatope.es', main_img:'atope.jpeg'};
        var est2 = {name: 'Gym Noray', desc: 'Gimnasio muy acondicionado y en perfecto estado.',
            city: 'Alicante', province: 'Santa Pola', addr: 'Calle Falsa nº34',
            phone: '965662347', website: 'http://wwww.noraygym.com', main_img:'noray.jpeg'};
        var owner = {uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738', name: 'Norman', lname: 'Coloma García',
            email: 'ua.norman@mail.com', gender: 'male'}
        supertest(app)
            .get('/api/sports/1/establishments')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.establishments.length, 2);
                assert.equal(res.body.establishments[0], est1);
                assert.equal(res.body.establishments[0].Owner, owner);
                assert.equal(res.body.establishments[1], est2);
                assert.equal(res.body.establishments[1].Owner, owner);
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after, 0);
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'none');
            })
            .end(done);
    })

    it('Getting all establishments where the sport is imparted, which does not exists.Should return status 400', function(done){
        supertest(app)
            .get('/api/sports/15/establishments')
            .expect(400)
            .expect(function (res) {
                assert.equal(res.body.message, 'The sport was not found');
            })
            .end(done);
    })
    it('Getting all establishments where the sport is imparted, by passing the id as string.Should return status 400', function(done){
        supertest(app)
            .get('/api/sports/Zumba/establishments')
            .expect(400)
            .expect(function (res) {
                assert.equal(res.body.message, 'The supplied id that specifies the sport is not a numercial id');
            })
            .end(done);
    })

    it('Getting all establishments where the sport is imparted without specify cursor but limit.Should return status 200',
        function(done){
        var est1 = {name: 'Gym A Tope', desc: 'Gimnasio perfecto para realizar tus actividades deportivas.',
            city: 'Alicante', province: 'San Vicente del Raspeig', addr: 'Calle San Franciso nº15',
            phone: '965660327', website: 'http://wwww.gymatope.es', main_img:'atope.jpeg'};
        var est2 = {name: 'Gym Noray', desc: 'Gimnasio muy acondicionado y en perfecto estado.',
            city: 'Alicante', province: 'Santa Pola', addr: 'Calle Falsa nº34',
            phone: '965662347', website: 'http://wwww.noraygym.com', main_img:'noray.jpeg'};
        var owner = {uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738', name: 'Norman', lname: 'Coloma García',
            email: 'ua.norman@mail.com', gender: 'male'}
        supertest(app)
            .get('/api/sports/1/establishments?limit=2')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.establishments.length, 2);
                assert.equal(res.body.establishments[0], est1);
                assert.equal(res.body.establishments[0].Owner, owner);
                assert.equal(res.body.establishments[1], est2);
                assert.equal(res.body.establishments[1].Owner, owner);
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after, 0);
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'none');
            })
            .end(done);
    })

    it('Getting all establishments where the sport is imparted specifying after cursor.Should return status 200',
        function(done){
        var est1 = {name: 'Gym A Tope', desc: 'Gimnasio perfecto para realizar tus actividades deportivas.',
            city: 'Alicante', province: 'San Vicente del Raspeig', addr: 'Calle San Franciso nº15',
            phone: '965660327', website: 'http://wwww.gymatope.es', main_img:'atope.jpeg'};
        var est2 = {name: 'Gym Noray', desc: 'Gimnasio muy acondicionado y en perfecto estado.',
            city: 'Alicante', province: 'Santa Pola', addr: 'Calle Falsa nº34',
            phone: '965662347', website: 'http://wwww.noraygym.com', main_img:'noray.jpeg'};
        var owner = {uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738', name: 'Norman', lname: 'Coloma García',
            email: 'ua.norman@mail.com', gender: 'male'}
        var id = 1;
        var after = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/sports/1/establishments?after='+after+'limit=1')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.establishments.length, 2);
                assert.equal(res.body.establishments[0], est1);
                assert.equal(res.body.establishments[0].Owner, owner);
                assert.equal(res.body.establishments[1], est2);
                assert.equal(res.body.establishments[1].Owner, owner);
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body.establishments[1].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'http://127.0.0.1:3000/api/sports/1/establishments?after='+
                new Buffer(res.body.establishments[1].id.toString()).toString('base64')+'&limit=1');
            })
            .end(done);
    })

    it('Getting all establishments where the sport is imparted specifying before cursor.Should return status 200',
        function(done){
        var est1 = {name: 'Gym A Tope', desc: 'Gimnasio perfecto para realizar tus actividades deportivas.',
            city: 'Alicante', province: 'San Vicente del Raspeig', addr: 'Calle San Franciso nº15',
            phone: '965660327', website: 'http://wwww.gymatope.es', main_img:'atope.jpeg'};
        var est2 = {name: 'Gym Noray', desc: 'Gimnasio muy acondicionado y en perfecto estado.',
            city: 'Alicante', province: 'Santa Pola', addr: 'Calle Falsa nº34',
            phone: '965662347', website: 'http://wwww.noraygym.com', main_img:'noray.jpeg'};
        var owner = {uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738', name: 'Norman', lname: 'Coloma García',
            email: 'ua.norman@mail.com', gender: 'male'}
        var id = 1;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/sports/1/establishments?before='+before+'limit=1')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.establishments.length, 2);
                assert.equal(res.body.establishments[0], est1);
                assert.equal(res.body.establishments[0].Owner, owner);
                assert.equal(res.body.paging.cursors.before,
                    new Buffer(res.body.establishments[0].id.toString()).toString('base64'));
                assert.equal(res.body.paging.cursors.after, 0);
                assert.equal(res.body.paging.previous, 'http://127.0.0.1:3000/api/sports/1/establishments?before='+
                    new Buffer(res.body.establishments[0].id.toString()).toString('base64')+'&limit=1');
                assert.equal(res.body.paging.next, 'none');
            })
            .end(done);
    })

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
        })
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
        })
    it('Getting all establishments where the sport, but got 0 recors.Should return status 200',
        function(done){
            var id = 1;
            var before = new Buffer(id.toString()).toString('base64');
            supertest(app)
                .get('/api/sports/5/establishments?before='+before+'&limit=0')
                .expect(200)
                .expect(function (res) {
                    assert.equal(res.body.length, 0);
                })
                .end(done);
        })
    after('Dropping database',function(done) {
        umzug.down(['20151022133423-create-user', '20151016205501-sport-migration']).then(function (migrations) {
            done();
        });
    });
});