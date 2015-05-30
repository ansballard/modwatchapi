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
    eslint: {
      target: ["src/*.js"]
    },
    watch: {
      backend: {
        files: ["src/*.js"],
        tasks: ["eslint", "uglify:backend"]
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

  require("jit-grunt")(grunt);

  grunt.registerTask("default", ["eslint", "uglify:backend"]);
  grunt.registerTask("serve", ["default", "concurrent:dist"]);
};
