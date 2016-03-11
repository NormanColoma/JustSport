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
            migrate_BD: {
                command: 'sequelize db:migrate'
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
    grunt.registerTask('migrate BD', ['shell:migrate_BD']);
};