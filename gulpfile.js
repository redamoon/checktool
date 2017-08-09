'use strict';
/* =========================
  Module
========================= */
var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var runSequence = require('run-sequence');
var w3cValidation = require('gulp-w3c-html-validation');
var w3cCSSValidate = require('gulp-w3c-css');
var zip = require('gulp-zip');
var beautify = require('gulp-beautify');
var rename = require("gulp-rename");
var cache = require("gulp-cache");
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var plato = require('gulp-plato');

/* =========================
  Path
========================= */
var path = {
  dir : './source/',
  check_dir : './dest_check/',
  validations : 'validations/',
  w3c_css_validation : 'w3c_css_validation/',
  w3c_html_validation : 'w3c_html_validation/',
  js_validation : 'js_validation/'
};

/* =========================
  Task （既存のファイル削除）
========================= */
gulp.task('clean', function(callback) {
  del(path.check_dir, {
    dots: true,
    force: true
  }).then(function() {
    return cache.clearAll(callback);
  })
});

/* =========================
  Check W3C CSS Task
========================= */
gulp.task('check_css', function() {
  return gulp.src(path.dir + '**/*.css')
    .pipe(w3cCSSValidate())
    .pipe(gulp.dest(path.check_dir + path.w3c_css_validation))
});
gulp.task('css_report', function() {
  return gulp.src(path.check_dir + path.w3c_css_validation + '**/*.css')
    .pipe(rename({
        extname: '.json'
    }))
    .pipe(beautify({indent_size: 2}))
    .pipe(gulp.dest(path.check_dir + path.validations + 'css_validation/'))
});

/* =========================
  Check W3C HTML Task
========================= */
gulp.task('check_html', function() {
  return gulp.src(path.dir + '**/*.html')
    .pipe(w3cValidation({
      statusPath: path.check_dir + path.w3c_html_validation + 'validation-status.json',
      reportpath: path.check_dir + path.w3c_html_validation + 'validation-report.json',
      generateCheckstyleReport: path.check_dir + path.w3c_html_validation + 'validation.xml',
      relaxerror: ['Bad value X-UA-Compatible for attribute http-equiv on element meta.', 'Element title must not be empty.']
    }))
});
gulp.task('html_report', function() {
  gulp.src(path.check_dir + path.w3c_html_validation + '*.json')
    .pipe(beautify({indent_size: 2}))
    .pipe(gulp.dest(path.check_dir + path.validations + 'html_validation/'))
});

/* =========================
  Check JS Task
========================= */
gulp.task('check_js', function() {
  return gulp.src(path.dir + '**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(plato(path.check_dir + path.validations + path.js_validation, {
      jshint: '.jshintrc',
      complexity: {
        trycatch: true
      }
    }));
});

/* =========================
  Zip
========================= */
gulp.task('zip', function() {
  gulp.src(path.check_dir + path.validations + '**')
    .pipe(zip('validations.zip'))
    .pipe(gulp.dest(path.check_dir))
});

/* =========================
  Start Task
========================= */
gulp.task('default', ['clean'], function(callback) {
  runSequence('check_html', 'check_css',
    ['css_report', 'html_report', 'check_js'], 'zip', callback);
});
