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
    var id_gym_to_update = "";
    var owner = {
        uuid: '8b75a3aa-767e-46f1-ba86-a56a0f107738',
        name: 'Norman',
        lname: 'Coloma García',
        email: 'ua.norman@mail.com',
        gender: 'male'
    }
    before('Setting database in a known state',function(done) {
        umzug.execute({
            migrations: ['20151106004253-create-establishment','20151022133423-create-user','20151016205501-sport-migration',
            '20151106004323-create-establishmentsport'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151022133423-create-user','20151106004253-create-establishment','20151016205501-sport-migration','20151106004323-create-establishmentsport']).then(function(migrations){
                done();
            })
        })
    });

    before('Filling database', function(done){
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder','20151105165744-establishments-test-seeder','20151106235642-sport-test-seeder', '' +
            '20151106235801-sportestablishment-test-seeder'],
            method: 'up'
        }).then(function(mig){
            done();
        })
    })

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

    it('Updating establishment that exists with correct fields. Should return status 204', function(done){
        var est = {name: 'Gym Actualizar', desc: 'Las instalaciones deportivas defintivas',
            city: 'Madrid', province: 'Madrid', addr: 'Paseo de la Castellana nº100',
            phone: '965661520', website: 'http://wwww.justsport-gym.com', main_img:'js.jpeg',owner: owner_id};
        var update = {name: 'Gym Actualizar', desc: 'Las instalaciones deportivas defintivas',
            city: 'Alicante', province: 'Alicante', addr: 'Paseo de la Castellana nº100',
            phone: '965661520', website: 'http://wwww.justsport-gym.com', main_img:'js.jpeg',owner: owner_id}
        models.establishment.create(est).then(function(est){
            id_gym_to_update = est.id;
            supertest(app)
                .put('/api/establishments/'+id_gym_to_update).send(update)
                .set('Authorization', 'Bearer '+owner_token)
                .expect(204)
                .end(done);
        })
    })

    it('Checking out the establishment after full update.', function (done) {
        var update = {name: 'Gym Actualizar', desc: 'Las instalaciones deportivas defintivas',
            city: 'Alicante', province: 'Alicante', addr: 'Paseo de la Castellana nº100',
            phone: '965661520', website: 'http://wwww.justsport-gym.com', main_img:'js.jpeg',owner: owner_id}
        models.establishment.findOne({where:{id:id_gym_to_update}}).then(function(est){
            assert.equal(est.name, update.name);
            assert.equal(est.desc, update.desc);
            assert.equal(est.city, update.city);
            assert.equal(est.province, update.province);
            assert.equal(est.phone, update.phone);
            assert.equal(est.website, update.website);
            assert.equal(est.main_img, update.main_img);
            assert.equal(est.owner, owner_id);
            done();
        })
    })

    it('Updating establishment with malformed JSON. Should return status 400', function(done){
        var update = {name: 'Gym Actualizar', desc: 'Las instalaciones deportivas defintivas',
            city: 'Madrid', province: 'Madrid', addr: 'Paseo de la Castellana nº100',
            phone: '965661520', website: 'http://wwww.justsport-gym.com', main_img:'js.jpeg'}
        supertest(app)
            .put('/api/establishments/'+id_gym_to_update).send(update)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(400)
            .expect(function(res){
                assert.equal(res.body.message, 'Json is malformed: owner field is required for updatings');
            }).end(done);
    })

   it('Updating establishment without access token. Should return status 401', function(done){
        var update = {name: 'Gym Actualizar', desc: 'Las instalaciones deportivas defintivas',
            city: 'Madrid', province: 'Madrid', addr: 'Paseo de la Castellana nº100',
            phone: '965661520', website: 'http://wwww.justsport-gym.com', main_img:'js.jpeg', owner: '1222356'}
        supertest(app)
            .put('/api/establishments/'+id_gym_to_update).send(update)
            .expect(401)
            .end(done);
    })

    it('Updating only certain fields. Should return status 204', function(done){
        var update = {name: 'Gym Actualizado', desc: 'Las instalaciones deportivas están en mal estado', owner: owner_id}
        supertest(app)
            .put('/api/establishments/'+id_gym_to_update).send(update)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(204)
            .end(done);
    })

    it('Checking out the establishment after partil update.',function(done){
        var update = {name: 'Gym Actualizado', desc: 'Las instalaciones deportivas están en mal estado', owner: owner_id}
        models.establishment.findOne({where:{id:id_gym_to_update}}).then(function(est){
            assert.equal(est.name, update.name);
            assert.equal(est.desc, update.desc);
            assert.equal(est.city, 'Alicante');
            assert.equal(est.province, 'Alicante');
            assert.equal(est.phone, '965661520');
            assert.equal(est.website, 'http://wwww.justsport-gym.com');
            assert.equal(est.main_img, 'js.jpeg');
            assert.equal(est.owner, owner_id);
            done();
        })
    })

    it('Updating establishment passing a string as id. Should return status 400', function(done){
        var update = {name: 'Gym Actualizado', desc: 'Las instalaciones deportivas están en mal estado'}
        supertest(app)
            .put('/api/establishments/Gym').send(update)
            .set('Authorization', 'Bearer '+user_token)
            .expect(400)
            .expect(function(res){
                assert.equal(res.body.message, 'The supplied id that specifies the establishment is not a numercial id');
            }).end(done);
    })

    it('Updating establishment with duplicated phone. Should return status 500', function(done){
        var update = {name: 'Gym Actualizado', desc: 'Las instalaciones deportivas están en mal estado', phone: '965660327', owner: owner_id}
        supertest(app)
            .put('/api/establishments/'+id_gym_to_update).send(update)
            .set('Authorization', 'Bearer '+owner_token)
            .expect(500)
            .expect(function(res){
                assert.equal(res.body.name, 'SequelizeUniqueConstraintError');
                assert.equal(res.body.errors[0].message, 'phone must be unique');
            }).end(done);
    })

    it('Getting establishments without specify cursor. Should return status 200 and the first 5 establishments',function(done){
        supertest(app)
            .get('/api/establishments')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.establishments.length, 5);
                assert.equal(res.body.establishments[0].name, 'Gym A Tope');
                assert.equal(res.body.establishments[1].name, 'Gym Noray');
                assert.equal(res.body.establishments[2].name, 'Más Sport');
                assert.equal(res.body.establishments[3].name, 'Montemar');
                assert.equal(res.body.establishments[4].name, 'Gimnasio 13');
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body.establishments[4].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next,
                    'http://127.0.0.1:3000/api/establishments?after='+
                    new Buffer(res.body.establishments[4].id.toString()).toString('base64')+'&limit=5');
            })
            .end(done);
    })

    it('Getting establishments specifying cursor but limit. Should return status 200 and the first n establishments', function(done){
        supertest(app)
            .get('/api/establishments?limit=3')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.establishments.length, 3);
                assert.equal(res.body.establishments[0].name, 'Gym A Tope');
                assert.equal(res.body.establishments[1].name, 'Gym Noray');
                assert.equal(res.body.establishments[2].name, 'Más Sport');
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body.establishments[2].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next,
                    'http://127.0.0.1:3000/api/establishments?after='+
                    new Buffer(res.body.establishments[2].id.toString()).toString('base64')+'&limit=3');
            })
            .end(done);
    })

    it('Getting establishments specifying after cursor. Should return status 200 and the first n establishments', function(done){
        var id = 3;
        var after = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/establishments?after='+after+'&limit=3')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.establishments.length, 3);
                assert.equal(res.body.establishments[0].name, 'Montemar');
                assert.equal(res.body.establishments[1].name, 'Gimnasio 13');
                assert.equal(res.body.establishments[2].name, 'Just Sport');
                assert.equal(res.body.paging.cursors.before, new Buffer(res.body.establishments[0].id.toString()).toString('base64'));
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body.establishments[2].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'http://127.0.0.1:3000/api/establishments?before='+
                    new Buffer(res.body.establishments[0].id.toString()).toString('base64')+'&limit=3');
                assert.equal(res.body.paging.next,
                    'http://127.0.0.1:3000/api/establishments?after='+
                    new Buffer(res.body.establishments[2].id.toString()).toString('base64')+'&limit=3');
            })
            .end(done);
    })

    it('Getting establishments specifying before cursor. Should return status 200 and the first n establishments', function(done){
        var id = 6;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/establishments?before='+before+'&limit=3')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.establishments.length, 3);
                assert.equal(res.body.establishments[0].name, 'Gym A Tope');
                assert.equal(res.body.establishments[1].name, 'Gym Noray');
                assert.equal(res.body.establishments[2].name, 'Más Sport');
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body.establishments[2].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next,
                    'http://127.0.0.1:3000/api/establishments?after='+
                    new Buffer(res.body.establishments[2].id.toString()).toString('base64')+'&limit=3');
            })
            .end(done);
    })

    it('Getting establishment that exists. Should return status 200',function(done){
        var est3 = {name: 'Más Sport', desc: 'Asociación deportiva con unas instalaciones increíbles.',
            city: 'Valencia', province: 'Valencia', addr: 'Calle Arco nº32',
            phone: '965663057', website: 'http://wwww.masport.es', main_img:'mas.jpeg',owner: owner_id};
        supertest(app)
            .get('/api/establishments/3')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.name, est3.name);
                assert.equal(res.body.desc, est3.desc);
                assert.equal(res.body.city, est3.city);
                assert.equal(res.body.province, est3.province);
                assert.equal(res.body.phone, est3.phone);
                assert.equal(res.body.website, est3.website);
                assert.equal(res.body.main_img, est3.main_img);
                assert.equal(res.body.Owner.uuid, owner.uuid);
                assert.equal(res.body.Owner.name, owner.name);
                assert.equal(res.body.Owner.lname, owner.lname);
                assert.equal(res.body.Owner.email, owner.email);
                assert.equal(res.body.Owner.gender, owner.gender);
            })
            .end(done);
    })


    it('Getting establishment that does not exist. Should return status 404',function(done){
        supertest(app)
            .get('/api/establishments/25')
            .expect(404)
            .expect(function (res) {
                assert.equal(res.body.message, 'The establishment was not found');
            })
            .end(done);
    })

    it('Getting establishment passing string as id.Should return status 400',function(done){
        supertest(app)
            .get('/api/establishments/GymATope')
            .expect(400)
            .expect(function (res) {
                assert.equal(res.body.message, 'The supplied id that specifies the establishment is not a numercial id');
            })
            .end(done);
    })

    it('Getting all sports imparted in the establishment.Should return status 200', function(done){
        supertest(app)
            .get('/api/establishments/1/sports')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.sports.length, 3);
                assert.equal(res.body.sports[0].name, 'Spinning');
                assert.equal(res.body.sports[1].name, 'GAP');
                assert.equal(res.body.sports[2].name, 'Body Jump');
            })
            .end(done);
    })

    it('Getting all sports imparted in establishment that does not exist.Should return status 404', function(done){
        supertest(app)
            .get('/api/establishments/15/sports')
            .expect(404)
            .expect(function (res) {
                assert.equal(res.body.message, 'The establishment was not found');
            })
            .end(done);
    })

    it('Getting all sports imparted from establishment that is empty yet.Should return status 200', function(done){
        supertest(app)
            .get('/api/establishments/5/sports')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.length, 0);
            })
            .end(done);
    })

    it('Getting all sports without specify cursor but limit. Should return status 200 and the first n sports set by the limit', function(done){
        supertest(app)
            .get('/api/establishments/1/sports?limit=1')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.sports.length, 1);
                assert.equal(res.body.sports[0].name, 'Spinning');
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body.sports[0].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next,
                    'http://127.0.0.1:3000/api/establishments/1/sports?after='+
                    new Buffer(res.body.sports[0].id.toString()).toString('base64')+'&limit=1');
            })
            .end(done);
    })

    it('Getting all sports without specify cursor but limit (0). Should return status 400', function(done){
        supertest(app)
            .get('/api/establishments/1/sports?limit=0')
            .expect(400)
            .expect(function (res) {
                assert.equal(res.body.message, "The limit for pagination, must be greater than 0");
            })
            .end(done);
    })

    it('Getting all sports specifying after cursor. Should return status 200 and the first n sports', function(done){
        var id = 1;
        var after = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/establishments/1/sports?after='+after+'&limit=2')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.sports.length, 2);
                assert.equal(res.body.sports[0].name, 'GAP');
                assert.equal(res.body.sports[1].name, 'Body Jump');
                assert.equal(res.body.paging.cursors.before,
                    new Buffer(res.body.sports[0].id.toString()).toString('base64'));
                assert.equal(res.body.paging.cursors.after, 0);
                assert.equal(res.body.paging.previous, 'http://127.0.0.1:3000/api/establishments/1/sports?before='+
                    new Buffer(res.body.sports[0].id.toString()).toString('base64')+'&limit=2');
                assert.equal(res.body.paging.next, 'none');
            })
            .end(done);
    })

    it('Getting all sports specifying before cursor. Should return status 200 and the first n sports', function(done){
        var id = 3;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/establishments/1/sports?before='+before+'&limit=2')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.sports.length, 2);
                assert.equal(res.body.sports[0].name, 'Spinning');
                assert.equal(res.body.sports[1].name, 'GAP');
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body.sports[1].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'http://127.0.0.1:3000/api/establishments/1/sports?after='+
                    new Buffer(res.body.sports[1].id.toString()).toString('base64')+'&limit=2');
            })
            .end(done);
    })


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
    })


    after('Dropping database',function(done) {
        seeder.execute({
            migrations: ['20151106235801-sportestablishment-test-seeder','20151106235642-sport-test-seeder','20151105165531-user-test-seeder',
            '20151105165744-establishments-test-seeder'],
            method: 'down'
        }).then(function(mig){
            umzug.down(['20151106004323-create-establishmentsport','20151106004253-create-establishment','20151016205501-sport-migration',
                '20151022133423-create-user']).then(function (migrations) {
                done();
            });
        })
    });
});