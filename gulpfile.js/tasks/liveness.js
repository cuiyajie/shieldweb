var config      = require('../config')
if(!config.tasks.liveness) return

var pkg = require('../../package.json');

var del    = require('del')
var changed     = require('gulp-changed')
var gulp        = require('gulp')
var imagemin    = require('gulp-imagemin')

var sass         = require('gulp-sass')
var handleErrors = require('../lib/handleErrors')
var autoprefixer = require('gulp-autoprefixer')
var cssnano      = require('gulp-cssnano')

var livenessMinJSConfig  = require('../lib/webpack-liveness-config')({ uncompressed: true })
var livenessJSConfig  = require('../lib/webpack-liveness-config')()
var logger  = require('../lib/compileLogger')
var webpack = require('webpack')

var gulpReplace = require('gulp-replace')
var gulpZip = require('gulp-zip')
var gulpSequence = require('gulp-sequence')
var mergeStream = require('merge-stream')
var path        = require('path')

var docPaths = {
  src: path.join(config.root.src, config.tasks.liveness.doc.src),
  dest: path.join(config.root.livenessDest) 
}

var imagePaths = {
  src: path.join(config.root.src, config.tasks.liveness.images.src, '/**/*.{' + config.tasks.images.extensions + '}'),
  dest: path.join(config.root.livenessDest, config.tasks.liveness.images.dest)
}

var cssPaths = {
  src: path.join(config.root.src, config.tasks.liveness.css.src),
  dest: path.join(config.root.livenessDest, config.tasks.liveness.css.dest)
}

var livenessClean = function(cb) {
  del([path.join(config.root.livenessDest, '/**'), path.join('!', config.root.livenessDest)]).then(function (paths) {
    cb()
  })
}

var livenessMinJS = function(cb) {
  webpack(livenessMinJSConfig, function(err, stats) {
    logger(err, stats)
    cb()
  })
}

var livenessJS = function(cb) {
  webpack(livenessJSConfig, function(err, stats) {
    logger(err, stats)
    cb()
  })
}

var livenessAsset = function() {
  return mergeStream(
           gulp.src(docPaths.src)
               .pipe(gulp.dest(docPaths.dest)),
           gulp.src([imagePaths.src, '*!README.md'])
               .pipe(changed(imagePaths.dest)) // Ignore unchanged files
               // .pipe(imagemin()) // Optimize
               .pipe(gulp.dest(imagePaths.dest)),
           gulp.src(cssPaths.src)
               .pipe(sass(config.tasks.css.sass))
               .on('error', handleErrors)
               .pipe(autoprefixer(config.tasks.css.autoprefixer))
               .pipe(cssnano({autoprefixer: false}))
               .pipe(gulp.dest(cssPaths.dest)))
}

var livenessReplace = function() {
  return gulp.src([path.join(config.root.livenessDest, '/**/*.{js,css}')], { base: './' })
             .pipe(gulpReplace('../../images/liveness/', 'images/'))
             .pipe(gulp.dest('./'))
}

var livenessZip = function() {
  return gulp.src(path.join(config.root.livenessDest, '/**/*'))
             .pipe(gulpZip('liveness-jssdk.' + pkg.livenessVersion + '.zip'))
             .pipe(gulp.dest(config.root.livenessDest))
}

gulp.task('liveness-clean', livenessClean)
gulp.task('liveness-min-js', livenessMinJS)
gulp.task('liveness-js', livenessJS)
gulp.task('liveness-asset', livenessAsset)
gulp.task('liveness-replace', livenessReplace)
gulp.task('liveness-zip', livenessZip)

var livenessTask = function(cb) {
  gulpSequence('liveness-clean', 'liveness-js', 'liveness-min-js', 'liveness-asset', 'liveness-replace', 'liveness-zip', cb)
}

gulp.task('liveness', livenessTask)
module.exports = livenessTask