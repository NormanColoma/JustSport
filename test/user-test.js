var supertest = require('supertest');
var assert  = require ('assert')
var models = require("../models");
var app = require('../app');
var Umzug = require('umzug');
var umzug = new Umzug();


describe('User', function(){
    var user = {name: 'Norman', lname: 'Coloma García', email: 'ua.norman@gmail.com', pass: 'adi2015', gender: 'male'};
    it('should return the posted', function(done){
        supertest(app)
            .post('/api/users/new').send(user)
            .expect(201)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, 'Norman');
                assert.equal(res.body.lname, 'Coloma García');
                assert.equal(res.body.email, "ua.norman@gmail.com")
                assert.equal(res.body.gender, "male");
                assert.equal(res.get('Location'), 'http://127.0.0.1:3000/api/users/'+res.body.id);
            }).end(done);

    });
    xit('should return status 500, unique constrainr error', function(done){

        supertest(app)
            .post('/api/users/new').send(user)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, 'SequelizeUniqueConstraintError');
                assert.equal(res.body.errors.message, 'email must be unique');
            }).end(done);
    });
});