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

describe('User', function(){
    this.timeout(15000);
    var user = {name: 'Norman', lname: 'Coloma García', email: 'ua.norman@mail.com', pass: 'adi2015', gender: 'male'};
    var credentials = {
        "grant_type" : "password",
        "username" : "ua.norman@mail.com",
        "password" : "adi2015"
    };
    var token = "";
    var user_id="";
    before('Setting database in a known state',function(done) {
        umzug.execute({
            migrations: ['20151022133423-create-user'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151022133423-create-user','20160311103832-add-img-user']).then(function(){
                done();
            });
        });
    });
    it('Creating user that does not exist already. Should return the posted user', function(done){

        supertest(app)
            .post('/api/users/new').send(user)
            .expect(201)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, 'Norman');
                assert.equal(res.body.lname, 'Coloma García');
                assert.equal(res.body.email, 'ua.norman@mail.com');
                assert.equal(res.body.gender, 'male');
                assert.equal(res.body.role, 'user');
                assert.equal(res.get('Location'), 'http://127.0.0.1:3000/api/users/'+res.body.uuid);
            }).end(done);

    });
    it('Creating user that already exists. Should return status 500, unique constrainr error', function(done){

        supertest(app)
            .post('/api/users/new').send(user)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.errors.length, 1);
                assert.equal(res.body.errors[0].type, "Duplicated entry");
                assert.equal(res.body.errors[0].field, "email");
                assert.equal(res.body.errors[0].message, "The value: 'ua.norman@mail.com' is already taken");
            }).end(done);
    });
    it('Getting access token and user id', function(done){
        supertest(app)
            .post('/api/oauth2/token').send(credentials)
            .expect(200).expect(function(res){
                assert(res.body.access_token);
                token = res.body.access_token;
                models.user.findOne({where : {email: 'ua.norman@mail.com'}, attributes: ['uuid']}).then(function(user){
                    user_id = user.uuid;
                    assert(user_id);
                });
            }).end(done);
    });


    it('Updating user that does not exist. Should return status 404', function(done){
        supertest(app)
        var data = {pass: 'nuevo2016'};
        supertest(app)
            .put('/api/users/111-232-adx578').send(data)
            .set('Authorization', 'Bearer '+token)
            .expect(404)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.message, 'User was not found');
            }).end(done);
    });

    it('Updating user without senging pass. Should return status 500', function(done){
        supertest(app)
        var data = { role: 'owner'};
        supertest(app)
            .put('/api/users/'+user_id).send(data)
            .set('Authorization', 'Bearer '+token)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.errors[0].message, 'pass cannot be null');
            }).end(done);
    });

    it('Updating user sending null pass. Should return status 500', function(done){
        supertest(app)
        var data = { pass: null};
        supertest(app)
            .put('/api/users/'+user_id).send(data)
            .set('Authorization', 'Bearer '+token)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.errors[0].message, 'pass cannot be null');
            }).end(done);
    });

    it('Updating user sending not valid pass. Should return status 500', function(done){
        supertest(app)
        var data = { pass: '123'};
        supertest(app)
            .put('/api/users/'+user_id).send(data)
            .set('Authorization', 'Bearer '+token)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.errors[0].message, 'pass is not valid. It must be at least 6 characters, ' +
                    'no more than 15, and must include at least one lower case letter, and one numeric digit');
            }).end(done);
    });

    it('Updating user sending not valid role. Should return status 500', function(done){
        supertest(app)
        var data = { pass: 'admin2015', role:"pepe"};
        supertest(app)
            .put('/api/users/'+user_id).send(data)
            .set('Authorization', 'Bearer '+token)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.errors[0].message, "role must match 'user' or 'owner' values");
            }).end(done);
    });

    it('Updating user sending not valid gender. Should return status 500', function(done){
        supertest(app)
        var data = { pass: 'admin2015', gender:"pepe"};
        supertest(app)
            .put('/api/users/'+user_id).send(data)
            .set('Authorization', 'Bearer '+token)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.errors[0].message, "gender must match 'male' or 'female' values");
            }).end(done);
    });


    it('Deleting user without being himself. Should return status 403', function(done){
        supertest(app)
            .delete('/api/users/111-222-adf568')
            .set('Authorization', 'Bearer '+token)
            .expect(403)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.message, 'You are not authorized to perform this action');
            }).end(done);
    });
    it('Deleting user that exists. Should return status 204', function(done){
        supertest(app)
            .delete('/api/users/'+user_id)
            .set('Authorization', 'Bearer '+token)
            .expect(204)
            .end(done);
    });
    it('Retrieving info about user that exists. Should return status 200', function(done){
        models.user.create(user).then(function(user){
            supertest(app)
                .get('/api/users/'+user.uuid)
                .expect(200)
                .expect(function(res){
                    assert.equal(res.body.name, 'Norman');
                    assert.equal(res.body.lname, 'Coloma García');
                    assert.equal(res.body.email, 'ua.norman@mail.com');
                    assert.equal(res.body.gender, 'male');
                    assert.equal(res.body.role, 'user');
                }).end(done);
        });
    });
    it('Retrieving info about user that does not exist. Should return status 404', function(done){
        supertest(app)
            .get('/api/users/111-222-adf568')
            .expect(404)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.message, 'User was not found');
            }).end(done);
    });


    it('Creating user with invalid required fields. Should return status 500', function(done){
        var user = {name: 'Norman12', lname: 'Coloma García12', email: 'ua.norman.com', pass: 'adi20'};
        supertest(app)
            .post('/api/users/new').send(user)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.errors.length, 4);
                assert.equal(res.body.errors[0].message, 'name must only contain letters');
                assert.equal(res.body.errors[1].message, 'lname must only contain letters');
                assert.equal(res.body.errors[2].message, 'email is not valid, it must be like: youremail@domain.es');
                assert.equal(res.body.errors[3].message, 'pass is not valid. It must be at least 6 characters, no more ' +
                    'than 15, and must include at least one lower case letter, and one numeric digit');
            }).end(done);

    });

    it('Creating user with null fields. Should return status 500', function(done){
        var user = {name: 'Norman', pass: 'adi2015', gender: 'male'}; //email and lname are required
        supertest(app)
            .post('/api/users/new').send(user)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.errors.length, 2);
                assert.equal(res.body.errors[0].message, 'lname cannot be null');
                assert.equal(res.body.errors[1].message, 'email cannot be null');
            }).end(done);

    });

    it('Creating user with optional fields, but not the corrects. Should return status 500', function(done){
        var user = {name: 'Norman', lname: 'Coloma García', email: 'ua.norman@gmail.com', pass: 'adi2015', gender: 'not correct_gender',
        role: 'admin'};
        supertest(app)
            .post('/api/users/new').send(user)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.errors.length, 2);
                assert.equal(res.body.errors[0].message, "gender must match 'male' or 'female' values");
                assert.equal(res.body.errors[1].message, "role must match 'user' or 'owner' values");
            }).end(done);

    });

    after('Dropping database',function(done) {
        umzug.down(['20160311103832-add-img-user','20151022133423-create-user']).then(function (migrations) {
            done();
        });
    });
});