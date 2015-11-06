/**
 * Created by Norman on 05/11/2015.
 */
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

describe('Establishments', function(){
    var credentials = {
        "grant_type" : "password",
        "username" : "ua.norman@mail.com",
        "password" : "adi2015"
    };
    var owner_token = "";
    var user_token = "";
    var owner_id = '8b75a3aa-767e-46f1-ba86-a56a0f107738';
    var id_gym_to_remove = "";
    before('Setting database in a known state',function(done) {
        umzug.execute({
            migrations: ['20151106004253-create-establishment','20151022133423-create-user'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151022133423-create-user','20151106004253-create-establishment']).then(function(migrations){
                seeder.execute({
                    migrations: ['20151105165531-user-test-seeder','20151105165744-establishments-test-seeder'],
                    method: 'up'
                }).then(function(mig){
                    done();
                }).catch(function(err){
                    done();
                })
            })
        }).catch(function(err){
            done();
        })
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

    it('Registering new establishment. Should return status 201',function(done){
        var est = {name: 'Just Sport', desc: 'Las instalaciones deportivas defintivas',
            city: 'Madrid', province: 'Madrid', addr: 'Paseo de la Castellana nº100',
            phone: '965661010', website: 'http://wwww.justsport-gym.com', main_img:'js.jpeg',owner: owner_id};
        supertest(app)
            .post('/api/establishments/new').send(est)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(201)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, est.name);
                assert.equal(res.body.desc, est.desc);
                assert.equal(res.body.city, est.city);
                assert.equal(res.body.province, est.province);
                assert.equal(res.body.addr, est.addr);
                assert.equal(res.body.phone, est.phone);
                assert.equal(res.body.website, est.website);
                assert.equal(res.body.main_img, est.main_img);
                assert.equal(res.body.owner, est.owner);
                assert.equal(res.get('Location'), 'http://127.0.0.1:3000/api/establishments/'+res.body.id);
            }).end(done);
    });

    it('Registering new establishment with duplicated phone. Should return status 500',function(done){
        var est = {name: 'Just Sport', desc: 'Las instalaciones deportivas defintivas',
            city: 'Madrid', province: 'Madrid', addr: 'Paseo de la Castellana nº100',
            phone: '965661010', website: 'http://wwww.justsport-gym.com', main_img:'js.jpeg',owner: owner_id};
        supertest(app)
            .post('/api/establishments/new').send(est)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, 'SequelizeUniqueConstraintError');
                assert.equal(res.body.errors[0].message, 'phone must be unique');
            }).end(done);
    });

    it('Registering new establishment passing malformed JSON. Should return status 400',function(done){
        var est = {name: 'Just Sport', desc: 'Las instalaciones deportivas defintivas',
            city: 'Madrid', province: 'Madrid', addr: 'Paseo de la Castellana nº100',owner: owner_id};
        supertest(app)
            .post('/api/establishments/new').send(est)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(400)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.message, 'Json is malformed, it must include the following fields: name, desc, city, province, addr, owner, phone, website(optional), main_img(optional)');
            }).end(done);
    });

    it('Registering new establishment without being owner. Should return status 403',function(done){
        var est = {name: 'Just Sport', desc: 'Las instalaciones deportivas defintivas',
            city: 'Madrid', province: 'Madrid', addr: 'Paseo de la Castellana nº100',
            phone: '965661010', website: 'http://wwww.justsport-gym.com', main_img:'js.jpeg',owner: owner_id};
        supertest(app)
            .post('/api/establishments/new').send(est)
            .set('Authorization', 'Bearer '+user_token)
            .expect(403)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.message, 'You are not authorized to perform this action');
            }).end(done);
    });

    it('Deleting establishment that exists. Should return status 204', function(done){
        var est = {name: 'Gym Borrar', desc: 'Las instalaciones deportivas defintivas',
            city: 'Madrid', province: 'Madrid', addr: 'Paseo de la Castellana nº100',
            phone: '965661520', website: 'http://wwww.justsport-gym.com', main_img:'js.jpeg',owner: owner_id};
        models.establishment.create(est).then(function(est){
            id_gym_to_remove = est.id;
            supertest(app)
                .delete('/api/establishments/'+id_gym_to_remove)
                .set('Authorization', 'Bearer '+owner_token)
                .expect(204)
                .end(done);
        })
    });

    it('Deleting establishment that does not exits. Should return status 404', function(done){
            supertest(app)
                .delete('/api/establishments/120')
                .set('Authorization', 'Bearer '+owner_token)
                .expect(404)
                .expect(function(res){
                    assert.equal(res.body.message, 'The establishment was not found');
                }).end(done);
    });

    it('Deleting establishment without being owner. Should return status 403', function(done){
        supertest(app)
            .delete('/api/establishments/'+id_gym_to_remove)
            .set('Authorization', 'Bearer '+user_token)
            .expect(403)
            .expect(function(res){
                assert.equal(res.body.message, 'You are not authorized to perform this action');
            }).end(done);
    });

    it('Deleting establishment passing a string as id. Should return status 400', function(done){
        supertest(app)
            .delete('/api/establishments/GymATope')
            .set('Authorization', 'Bearer '+owner_token)
            .expect(400)
            .expect(function(res){
                assert.equal(res.body.message, 'The supplied id that specifies the establishment is not a numercial id');
            }).end(done);
    });

    after('Dropping database',function(done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder','20151105165744-establishments-test-seeder'],
            method: 'down'
        }).then(function(mig){
            umzug.down(['20151106004253-create-establishment','20151022133423-create-user']).then(function (migrations) {
                done();
            });
        })
    });
});