'use strict';

// Gulp Dependencies
var gulp = require('gulp');
var rename = require('gulp-rename');

var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var _ = require("lodash");

// Build Dependencies
var browserify = require('gulp-browserify');

// Style Dependencies
var prefix = require('gulp-autoprefixer');

// Development Dependencies
var jshint = require('gulp-jshint');

// Test Dependencies
var mochaPhantomjs = require('gulp-mocha-phantomjs');

gulp.task('lint-server.js', function() {
  return gulp.src('/server.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('lint-public', function() {
  return gulp.src('./public/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('lint-lib', function() {
  return gulp.src('./lib/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});



gulp.task('serve', function () {

    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });

    gulp.watch("./public/*.html").on("change", browserSync.reload);
    //gulp.watch("./public/javascripts/*.js").on("change", browserSync.reload);
    //gulp.watch("./public/stylesheets/*.css").on("change", browserSync.reload);
});