var supertest = require('supertest');
var assert  = require ('assert')
var models = require("../models");
var app = require('../app');

describe('User', function(){
    var user = {name: 'Norman', lname: 'Coloma García', email: 'ua.norman@mail.com', pass: 'adi2015', gender: 'male'};
    it('should return the posted user', function(done){
        supertest(app)
            .post('/api/users/new').send(user)
            .expect(201)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, 'Norman');
                assert.equal(res.body.lname, 'Coloma García');
                assert.equal(res.body.email, 'ua.norman@mail.com')
                assert.equal(res.body.gender, 'male');
                assert.equal(res.body.role, 'user')
                assert.equal(res.get('Location'), 'http://127.0.0.1:3000/api/users/'+res.body.uuid);
            }).end(done);

    });
    it('should return status 500, unique constrainr error', function(done){

        supertest(app)
            .post('/api/users/new').send(user)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, 'SequelizeUniqueConstraintError');
            }).end(done);
    });
});