module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      backend: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        },
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['*.js'],
            dest: './',
            ext: '.min.js'
          }
        ]
      }
    },
    watch: {
      backend: {
        files: ['src/*.js'],
        tasks: ['uglify:backend']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['uglify:backend']);
};
