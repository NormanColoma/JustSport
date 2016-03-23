module.exports = function(grunt){

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-shell');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env : {
            options : {
                //Shared Options Hash
            },
            test : {
                NODE_ENV : 'test',
                UPLOAD_DEST: './test/test-uploads',
                UPLOAD_USER_DEST: './test/test-user-uploads',
                MAX_LISTENERS: '0'
            }
        },
        shell: {
            migrate_DB: {
                command: 'sequelize db:migrate'
            },
            seed_DB:{
                command: 'sequelize db:seed:all'
            }
        },
        jshint: {
            files: ['Gruntfile.js', './handlers/*.js','./middlewares/*.js','./routes/*.js','./test/**/*.js'],
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                        quiet: false, // Optionally suppress output to standard out (defaults to false)
                        clearRequireCache: true // Optionally clear the require cache before running tests (defaults to false)
                },
                src: ['test/**/*.js']
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'mochaTest']
        }
    });
    grunt.registerTask('default', ['env:test','jshint', 'mochaTest']);
    grunt.registerTask('test', ['env:test', 'mochaTest']);
    grunt.registerTask('migrate DB', ['shell:migrate_DB']);
    grunt.registerTask('seed DB', ['shell:seed_DB']);
};