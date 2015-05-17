module.exports = function(grunt) { "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    uglify: {
      backend: {
        options: {
          banner: "/*! <%= pkg.name %> <%= grunt.template.today(\"dd-mm-yyyy\") %> */\n"
        },
        files: [
          {
            expand: true,
            cwd: "src/",
            src: ["*.js"],
            dest: "./",
            ext: ".min.js"
          }
        ]
      }
    },
    watch: {
      backend: {
        files: ["src/*.js"],
        tasks: ["uglify:backend"]
      }
    },
    nodemon: {
      dist: {
        script: "app.min.js"
      }
    },
    concurrent: {
      dist: {
        tasks: [
          "nodemon",
          "watch"
        ],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-concurrent");
  grunt.loadNpmTasks("grunt-nodemon");

  grunt.registerTask("default", ["uglify:backend"]);
  grunt.registerTask("serve", ["concurrent"]);
};
