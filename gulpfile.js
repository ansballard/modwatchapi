(function() {
  "use strict";

  var gulp = require("gulp");
  var babel = require("gulp-babel");
  var uglify = require("gulp-uglify");
  var sourcemaps = require("gulp-sourcemaps");
  var plumber = require("gulp-plumber");
  var concat = require("gulp-concat");

  gulp.task("buildNode", function() {
    return gulp.src("src/*.js")
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(uglify())
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest("./dist/"))
    ;
  });

  gulp.task("default", ["buildNode"]);
  gulp.task("watch", ["default"], function() {
    gulp.watch("src/*.js", ["buildNode"]);
  });

  module.exports = function() {
    gulp.run("default");
  };

})();
