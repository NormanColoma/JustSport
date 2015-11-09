/**
 * Created by Norman on 09/11/2015.
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

describe('Course', function() {
    var est1 = {id: 1,name: 'Gym A Tope', desc: 'Gimnasio perfecto para realizar tus actividades deportivas.',
        city: 'San Vicente del Raspeig', province: 'Alicante', addr: 'Calle San Franciso n�15',
        phone: '965660327', website: 'http://wwww.gymatope.es', main_img:'atope.jpeg'};
    var est2 = {id: 2,name: 'Gym Noray', desc: 'Gimnasio muy acondicionado y en perfecto estado.',
        city: 'Santa Pola', province: 'Alicante', addr: 'Calle Falsa n�34',
        phone: '965662347', website: 'http://wwww.noraygym.com', main_img:'noray.jpeg'};
    var est3 = {id: 4, name: 'Montemar', desc: 'Especializados en cursos y clases de t�nis.',
        city: 'Alicante', province: 'Alicante', addr: 'Avenida Novelda Km 14',
        phone: '965662268', website: 'http://wwww.montemar.es', main_img:'montemar.jpeg'};
    before('Setting database in a known state: Deleting', function (done) {
        umzug.execute({
            migrations: ['20151108193656-create-course', '20151106004323-create-establishmentsport', '20151106004253-create-establishment',
                '20151022133423-create-user', '20151016205501-sport-migration'],
            method: 'down'
        }).then(function (migrations) {
            done();
        })
    });

    before('Setting database in a known state: Creating', function (done) {
        umzug.up(['20151022133423-create-user', '20151106004253-create-establishment', '20151016205501-sport-migration',
            '20151106004323-create-establishmentsport', '20151108193656-create-course']).then(function (migrations) {
            done();
        })
    });

    before('Filling database', function (done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder', '20151105165744-establishments-test-seeder', '20151106235642-sport-test-seeder', '' +
            '20151109102627-sportestablishment-test-seeder2', '20151108194604-course-test-seeder'],
            method: 'up'
        }).then(function (mig) {
            done();
        })
    })

    it('Getting all establishments filtered by sport and location.Should return status 200', function(done){
        supertest(app)
            .get('/api/establishments/sport/1/location/Alicante')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.Establishments.length, 2);
                assert.equal(res.body[0].id, est1.id);
                assert.equal(res.body[0].name, est1.name);
                assert.equal(res.body[0].desc, est1.desc);
                assert.equal(res.body[0].city, est1.city);
                assert.equal(res.body[0].province, est1.province);
                assert.equal(res.body[0].website, est1.website);
                assert.equal(res.body[0].phone, est1.phone);
                assert.equal(res.body[0].main_img, est1.main_img);
                assert.equal(res.body.Establishments[0].Course);
                assert.equal(res.body[1].id, est2.id);
                assert.equal(res.body[1].name, est2.name);
                assert.equal(res.body[1].desc, est2.desc);
                assert.equal(res.body[1].city, est2.city);
                assert.equal(res.body[1].province, est2.province);
                assert.equal(res.body[1].website, est2.website);
                assert.equal(res.body[1].phone, est2.phone);
                assert.equal(res.body[1].main_img, est2.main_img);
                assert.equal(res.body.Establishments[1].Course);
                assert.equal(res.body[2].id, est3.id);
                assert.equal(res.body[2].name, est3.name);
                assert.equal(res.body[2].desc, est3.desc);
                assert.equal(res.body[2].city, est3.city);
                assert.equal(res.body[2].province, est3.province);
                assert.equal(res.body[2].website, est3.website);
                assert.equal(res.body[2].phone, est3.phone);
                assert.equal(res.body[2].main_img, est3.main_img);
                assert.equal(res.body.Establishments[2].Course);
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after, 0);
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'none');
            })
            .end(done);
    })

    it('Getting all establishments filtered by sport and location (without specifiying cursor, but limit)' +
        '.Should return status 200', function(done){
        supertest(app)
            .get('/api/establishments/sport/1/location/Alicante?limit=2')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.Establishments.length, 2);
                assert.equal(res.body[0].id, est1.id);
                assert.equal(res.body[0].name, est1.name);
                assert.equal(res.body[0].desc, est1.desc);
                assert.equal(res.body[0].city, est1.city);
                assert.equal(res.body[0].province, est1.province);
                assert.equal(res.body[0].website, est1.website);
                assert.equal(res.body[0].phone, est1.phone);
                assert.equal(res.body[0].main_img, est1.main_img);
                assert.equal(res.body.Establishments[0].Course);
                assert.equal(res.body[1].id, est2.id);
                assert.equal(res.body[1].name, est2.name);
                assert.equal(res.body[1].desc, est2.desc);
                assert.equal(res.body[1].city, est2.city);
                assert.equal(res.body[1].province, est2.province);
                assert.equal(res.body[1].website, est2.website);
                assert.equal(res.body[1].phone, est2.phone);
                assert.equal(res.body[1].main_img, est2.main_img);
                assert.equal(res.body.Establishments[1].Course);
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after,
                    new Buffer(res.body[0].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'http://127.0.0.1:3000/api/establishments/sport/1/location/Alicante?after='+
                    new Buffer(res.body.sports[0].id.toString()).toString('base64')+'&limit=2');
            })
            .end(done);
    })


    it('Getting all establishments filtered by sport and location (specifying after cursor)' +
        '.Should return status 200', function(done){
        var id=2;
        var after = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/establishments/sport/1/location/Alicante?after'+after+'&limit=2')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.Establishments.length, 1);
                assert.equal(res.body[0].id, est3.id);
                assert.equal(res.body[0].name, est3.name);
                assert.equal(res.body[0].desc, est3.desc);
                assert.equal(res.body[0].city, est3.city);
                assert.equal(res.body[0].province, est3.province);
                assert.equal(res.body[0].website, est3.website);
                assert.equal(res.body[0].phone, est3.phone);
                assert.equal(res.body[0].main_img, est3.main_img);
                assert.equal(res.body.Establishments[0].Course);
                assert.equal(res.body.paging.cursors.before, new Buffer(res.body[0].id.toString()).toString('base64'));
                assert.equal(res.body.paging.cursors.after,0);
                assert.equal(res.body.paging.previous, 'http://127.0.0.1:3000/api/establishments/sport/1/location/Alicante?before='+
                    new Buffer(res.body.sports[0].id.toString()).toString('base64')+'&limit=2');
                assert.equal(res.body.paging.next, 'none');
            })
            .end(done);
    })

    it('Getting all establishments filtered by sport and location (specifying befpre cursor)' +
        '.Should return status 200', function(done){
        var id=4;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/establishments/sport/1/location/Alicante?before'+before+'&limit=2')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.Establishments.length, 1);
                assert.equal(res.body[0].id, est3.id);
                assert.equal(res.body[0].name, est3.name);
                assert.equal(res.body[0].desc, est3.desc);
                assert.equal(res.body[0].city, est3.city);
                assert.equal(res.body[0].province, est3.province);
                assert.equal(res.body[0].website, est3.website);
                assert.equal(res.body[0].phone, est3.phone);
                assert.equal(res.body[0].main_img, est3.main_img);
                assert.equal(res.body.Establishments[0].Course);
                assert.equal(res.body[1].id, est2.id);
                assert.equal(res.body[1].name, est2.name);
                assert.equal(res.body[1].desc, est2.desc);
                assert.equal(res.body[1].city, est2.city);
                assert.equal(res.body[1].province, est2.province);
                assert.equal(res.body[1].website, est2.website);
                assert.equal(res.body[1].phone, est2.phone);
                assert.equal(res.body[1].main_img, est2.main_img);
                assert.equal(res.body.Establishments[1].Course);
                assert.equal(res.body.paging.cursors.before, 0);
                assert.equal(res.body.paging.cursors.after,new Buffer(res.body[1].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'http://127.0.0.1:3000/api/establishments/sport/1/location/Alicante?after='+
                    new Buffer(res.body.sports[1].id.toString()).toString('base64')+'&limit=2');
            })
            .end(done);
    })

    it('Getting all establishments filtered by sport and location (specifying after cursor but not limit)' +
        '.Should return status 400', function(done){
        var id=2;
        var after = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/establishments/sport/1/location/Alicante?after'+after)
            .expect(400)
            .expect(function (res) {
                assert.equal("Wrong parameters, limit parameter must be set for paging");
            })
            .end(done);
    })

    it('Getting all establishments filtered by sport and location (specifying before cursor but not limit)' +
        '.Should return status 400', function(done){
        var id=2;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/establishments/sport/1/location/Alicante?before'+before)
            .expect(400)
            .expect(function (res) {
                assert.equal("Wrong parameters, limit parameter must be set for paging");
            })
            .end(done);
    })

    after('Dropping database',function(done) {
        seeder.execute({
            migrations: ['20151108194604-course-test-seeder','20151109102627-sportestablishment-test-seeder2','20151106235642-sport-test-seeder','20151105165531-user-test-seeder',
                '20151105165744-establishments-test-seeder'],
            method: 'down'
        }).then(function(mig){
            umzug.down(['20151108193656-create-course','20151106004323-create-establishmentsport','20151106004253-create-establishment','20151016205501-sport-migration',
                '20151022133423-create-user']).then(function (migrations) {
                done();
            });
        })
    });

})