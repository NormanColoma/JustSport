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

describe('Establishments', function(){
    var owner = {name: 'Norman', lname: 'Coloma García', email: 'ua.norman@mail.com', pass: 'adi2015', gender: 'male', role: "owner"};
    var user = {name: 'Pepe', lname: 'Pardo García', email: 'pepe@mail.com', pass: 'adi2015', gender: 'male'};
    var credentials = {
        "grant_type" : "password",
        "username" : "ua.norman@mail.com",
        "password" : "adi2015"
    };
    var owner_token = "";
    var user_token = "";
    before('Setting database in a known state',function(done) {
        var est1 = {name: 'Gym A Tope', desc: 'Gimnasio perfecto para realizar tus actividades deportivas.',
            city: 'Alicante', province: 'San Vicente del Raspeig', addr: 'Calle San Franciso nº15',
            phone: '965660327', website: 'http://wwww.gymatope.es', main_img:'atope.jpeg',owner: owner.uuid};
        var est2 = {name: 'Gym Noray', desc: 'Gimnasio muy acondicionado y en perfecto estado.',
            city: 'Alicante', province: 'Santa Pola', addr: 'Calle Falsa nº34',
            phone: '965662347', website: 'http://wwww.noraygym.com', main_img:'noray.jpeg',owner: owner.uuid};
        var est3 = {name: 'Más Sport', desc: 'Asociación deportiva con unas instalaciones increíbles.',
            city: 'Valencia', province: 'Valencia', addr: 'Calle Arco nº32',
            phone: '965663057', website: 'http://wwww.masport.es', main_img:'mas.jpeg',owner: owner.uuid};
        var est4 = {name: 'Montemar', desc: 'Especializados en cursos y clases de ténis.',
            city: 'Alicante', province: 'Alicante', addr: 'Avenida Novelda Km 14',
            phone: '965662268', website: 'http://wwww.montemar.es', main_img:'montemar.jpeg',owner: owner.uuid};
        var est5 = {name: 'Gimnasio 13', desc: 'El mejor lugar para ponerte en forma.',
            city: 'Barcelona', province: 'Barcelona', addr: 'Gran Vía nº15',
            phone: '965662257', website: 'http://wwww.13gym.es', main_img:'13gym.jpeg',owner: owner.uuid};
        umzug.execute({
            migrations: ['20151022133423-create-user', '20151018190348-create-establishment'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151018190348-create-establishment','20151022133423-create-user']).then(function(){
                models.user.create(owner).then(function(){
                    models.user.create(user).then(function(){
                        models.establishment.bulkCreate([est1,est2,est3,est4,est5]).then(function(){
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
                owner_token = res.body.access_token;
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

    it('Registering new establishment. Should return status 201',function(){
        var est = {name: 'Just Sport', desc: 'Las instalaciones deportivas defintivas',
            city: 'Madrid', province: 'Madrid', addr: 'Paseo de la Castellana nº100',
            phone: '965661010', website: 'http://wwww.justsport-gym.com', main_img:'js.jpeg',owner: owner.uuid};
        supertest(app)
            .get('/api/establishments/new').send(est)
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

    it('Registering new establishment with duplicated phone. Should return status 500',function(){
        var est = {name: 'Just Sport', desc: 'Las instalaciones deportivas defintivas',
            city: 'Madrid', province: 'Madrid', addr: 'Paseo de la Castellana nº100',
            phone: '965661010', website: 'http://wwww.justsport-gym.com', main_img:'js.jpeg',owner: owner.uuid};
        supertest(app)
            .get('/api/establishments/new').send(est)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(500)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.name, 'SequelizeUniqueConstraintError');
                assert.equal(res.body.errors[0].message, 'phone must be unique');
            }).end(done);
    });

    it('Registering new establishment passing malformed JSON. Should return status 400',function(){
        var est = {name: 'Just Sport', desc: 'Las instalaciones deportivas defintivas',
            city: 'Madrid', province: 'Madrid', addr: 'Paseo de la Castellana nº100',owner: owner.uuid};
        supertest(app)
            .get('/api/establishments/new').send(est)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(400)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.message, 'Json is malformed, it must include the following fields: name, desc, city, province, addr, owner, phone, website(optional), main_img(optional)');
            }).end(done);
    });

    it('Registering new establishment without being owner. Should return status 403',function(){
        var est = {name: 'Just Sport', desc: 'Las instalaciones deportivas defintivas',
            city: 'Madrid', province: 'Madrid', addr: 'Paseo de la Castellana nº100',
            phone: '965661010', website: 'http://wwww.justsport-gym.com', main_img:'js.jpeg',owner: owner.uuid};
        supertest(app)
            .get('/api/establishments/new').send(est)
            .set('Authorization', 'Bearer '+user_token)
            .expect(403)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(function(res){
                assert.equal(res.body.message, 'You are not authorized to perform this action');
            }).end(done);
    });

    after('Dropping database',function(done) {
        umzug.down(['20151022133423-create-user','20151018190348-create-establishment']).then(function (migrations) {
            done();
        });
    });
});