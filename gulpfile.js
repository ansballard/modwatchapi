var gulp = require("gulp");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var plumber = require("gulp-plumber");
var concat = require("gulp-concat");
var rename = require("gulp-rename");

gulp.task("buildNode", function() {
  "use strict";
  return gulp.src("src/*.js")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("./"))
  ;
});

gulp.task("default", ["buildNode"]);
gulp.task("watch", ["default"], function() {
  "use strict";
  gulp.watch("src/*.js", ["buildNode"]);
});

module.exports = function() { "use strict"; gulp.run("default"); };
