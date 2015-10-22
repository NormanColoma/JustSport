var users = require('../routes/users');
var supertest = require('supertest');
var assert  = require ('assert')
var app = require('../app');


describe('user model', function(){
    it('inserting new user', function(done){
        supertest(app)
            .post('/api/users/new').send({"name" : "Norman", "lname" : "Coloma García",
                "email" : "ua.norman@gmail.com", "pass" : "adi2015" , "gender" : "male"})
            .expect(201)
            .expect('Content-type', 'application/json; charset=utf-8')
            //.expect('Location', 'http://127.0.0.1:3000/api/users/15')
            .expect(function(res){
                assert.equal(res.body.name, 'Norman');
                assert.equal(res.body.lname, 'Coloma García');
                assert.equal(res.body.email, "ua.norman@gmail.com")
                assert.equal(res.body.gender, "male");
            }).end(done);

    });
});