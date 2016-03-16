/**
 * Created by Norman on 16/03/2016.
 */
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

describe.only('Establishments commentaries', function() {
    this.timeout(15000);
    before('Setting database in a known state', function (done) {
        umzug.execute({
            migrations: ['20151106004253-create-establishment', '20151022133423-create-user', '20151016205501-sport-migration',
                '20151106004323-create-establishmentsport', '20160315113959-create-commentary'],
            method: 'down'
        }).then(function (migrations) {
            umzug.up(['20151022133423-create-user', '20160311103832-add-img-user', '20151106004253-create-establishment', '20151016205501-sport-migration', '20151106004323-create-establishmentsport',
                '20160315113959-create-commentary']).then(function (migrations) {
                done();
            });
        });
    });

    before('Filling database', function (done) {
        seeder.execute({
            migrations: ['20151105165531-user-test-seeder', '20151105165744-establishments-test-seeder', '20151106235642-sport-test-seeder', '' +
            '20151106235801-sportestablishment-test-seeder'],
            method: 'up'
        }).then(function (mig) {
            done();
        });
    });

    it('Should return status 200, when retrieving the commentaries for establishment that exist', function(done){
        supertest(app)
            .get('/api/establishments/1/commentaries')
            .expect(200).expect(function(res){
                assert.equal(res.body.Commentaries.count, 15);
                assert.equal(res.body.Commentaries.rows.length, 10);
                for(var i=0;i<res.body.Commentaries.rows.length;i++) {
                    assert.equal(res.body.Commentaries.rows[i].id, i + 1);
                    assert.equal(res.body.Commentaries.rows[i].User.name, i + 'Pepe');
                    assert.equal(res.body.Commentaries.rows[i].User.name, i + 'Cano Gómez');
                }
                assert.equal(res.body.paging.cursors.before,0);
                assert.equal(res.body.paging.cursors.after, new Buffer(res.body.Commentaries.rows[9].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'http://127.0.0.1:3000/api/establishments/1/commentaries?after='+
                    new Buffer(res.body.Commentaries.rows[9].id.toString()).toString('base64')+'&limit=10');
            }).end(done);
    });

    it('Should return status 200, when retrieving the commentaries for establishment that exist, setting limit to 5', function(done){
        supertest(app)
            .get('/api/establishments/1/commentaries?limit=5')
            .expect(200).expect(function(res){
            assert.equal(res.body.Commentaries.count, 15);
                assert.equal(res.body.Commentaries.rows.length, 5);
                for(var i=0;i<res.body.Commentaries.rows.length;i++) {
                    assert.equal(res.body.Commentaries.rows[i].id, i + 1);
                    assert.equal(res.body.Commentaries.rows[i].User.name, i + 'Pepe');
                    assert.equal(res.body.Commentaries.rows[i].User.name, i + 'Cano Gómez');
                }
                assert.equal(res.body.paging.cursors.before,0);
                assert.equal(res.body.paging.cursors.after, new Buffer(res.body.Commentaries.rows[4].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'http://127.0.0.1:3000/api/establishments/1/commentaries?after='+
                    new Buffer(res.body.Commentaries.rows[4].id.toString()).toString('base64')+'&limit=10');
            }).end(done);
    });

    it('Should return status 200, when retrieving the commentaries for establishment that exist, setting after cursor', function(done){
        var id = 3;
        var after = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/establishments/1/commentaries?after='+after+'&limit=5')
            .expect(200).expect(function(res){
                assert.equal(res.body.Commentaries.count, 15);
                assert.equal(res.body.Commentaries.rows.length, 10);
                assert.equal(res.body.paging.cursors.before,new Buffer(res.body.Commentaries.rows[0].id.toString()).toString('base64'));
                assert.equal(res.body.paging.cursors.after, new Buffer(res.body.Commentaries.rows[9].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'http://127.0.0.1:3000/api/establishments/1/commentaries?before='+
                    new Buffer(res.body.Commentaries.rows[0].id.toString()).toString('base64')+'&limit=10');
                assert.equal(res.body.paging.next, 'http://127.0.0.1:3000/api/establishments/1/commentaries?after='+
                    new Buffer(res.body.Commentaries.rows[9].id.toString()).toString('base64')+'&limit=10');
            }).end(done);
    });

    it('Should return status 200, when retrieving the commentaries for establishment that exist, setting before cursor', function(done){
        var id = 10;
        var before = new Buffer(id.toString()).toString('base64');
        supertest(app)
            .get('/api/establishments/1/commentaries?after='+before+'&limit=5')
            .expect(200).expect(function(res){
                assert.equal(res.body.Commentaries.count, 15);
                assert.equal(res.body.Commentaries.rows.length, 9);
                assert.equal(res.body.paging.cursors.before,0);
                assert.equal(res.body.paging.cursors.after, new Buffer(res.body.Commentaries.rows[8].id.toString()).toString('base64'));
                assert.equal(res.body.paging.previous, 'none');
                assert.equal(res.body.paging.next, 'http://127.0.0.1:3000/api/establishments/1/commentaries?after='+
                new Buffer(res.body.Commentaries.rows[8].id.toString()).toString('base64')+'&limit=10');
            }).end(done);
    });

    it('Should return status 404, when trying to retieve commentaries for establishment that does not have any', function(done){
        supertest(app)
            .get('/api/establishments/2/commentaries')
            .expect(404).expect(function(res){
                assert.equal(res.body.message, 'There are no commentaries added yet');
            }).end(done);
    });

    it('Should return status 400, when passing the id of establishment as string', function(done){
        supertest(app)
            .get('/api/establishments/string/commentaries')
            .expect(400).expect(function(res){
                assert.equal(res.body.message, 'The supplied id that specifies the establishment is not a numercial id');
            }).end(done);
    });

    it('Should return status 404, when passing the id of establishment that does not exist', function(done){
        supertest(app)
            .get('/api/establishments/103/commentaries')
            .expect(404).expect(function(res){
                assert.equal(res.body.message, 'The establishment was not found');
            }).end(done);
    });

    it('Should return status 400, when setting limit <= 0', function(done){
        supertest(app)
            .get('/api/establishments/1/commentaries?limit=0')
            .expect(400).expect(function(res){
            assert.equal(res.body.message, 'The limit for pagination, must be greater than 0');
        }).end(done);
    });

    it('Should return status 400, when setting limit to string', function(done){
        supertest(app)
            .get('/api/establishments/1/commentaries?limit=string')
            .expect(400).expect(function(res){
            assert.equal(res.body.message, 'Limit parameter must be numerical');
        }).end(done);
    });

    it('Should return status 400, when passing empty limit', function(done){
        supertest(app)
            .get('/api/establishments/1/commentaries?limit=')
            .expect(400).expect(function(res){
            assert.equal(res.body.message, 'Wrong parameters, limit parameter must be set for paging');
        }).end(done);
    });

    it('Should return status 400, when passing empty after parameter', function(done){
        supertest(app)
            .get('/api/establishments/1/commentaries?after=&limit=10')
            .expect(400).expect(function(res){
            assert.equal(res.body.message, 'Wrong parameters, after parameter must be set for paging');
        }).end(done);
    });

    it('Should return status 400, when passing empty before parameter', function(done){
        supertest(app)
            .get('/api/establishments/1/commentaries?before=&limit=10')
            .expect(400).expect(function(res){
            assert.equal(res.body.message, 'Wrong parameters, before parameter must be set for paging');
        }).end(done);
    });

    after('Dropping database',function(done) {
        seeder.execute({
            migrations: ['20151106235801-sportestablishment-test-seeder','20151106235642-sport-test-seeder','20151105165531-user-test-seeder',
                '20151105165744-establishments-test-seeder'],
            method: 'down'
        }).then(function(mig){
            umzug.down(['20160315113959-create-commentary','20151106004323-create-establishmentsport','20151106004253-create-establishment','20151016205501-sport-migration',
                '20160311103832-add-img-user','20151022133423-create-user']).then(function (migrations) {
                done();
            });
        });
    });

});