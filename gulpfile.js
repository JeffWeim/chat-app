'use strict';

// Gulp Dependencies
var gulp = require('gulp');
var rename = require('gulp-rename');

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

gulp.task('watch', function() {
  gulp.watch('lib/**/*.js', ['browserify-lib']);
  gulp.watch('public/**/*.js', ['browserify-public']);
  gulp.watch('public/**/*.css', ['browserify-public']);
  gulp.watch('/server.js', ['browserify-server']);
});

gulp.task('default', ['test', 'build', 'watch']);