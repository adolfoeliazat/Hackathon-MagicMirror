var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var cssmin = require('gulp-cssmin');
var del = require('del');
var gettext = require('gulp-angular-gettext');
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var jscs = require('gulp-jscs');
var karmaServer = require('karma').Server;
var livereload = require('gulp-livereload');
var modRewrite = require('connect-modrewrite');
var ngAnnotate = require('gulp-ng-annotate');
var ngConfig = require('gulp-ng-config');
var ngHtml2js = require("gulp-ng-html2js");
var rename = require("gulp-rename");
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');
var useref = require('gulp-useref');
var util = require('gulp-util');

/*
 * --------------------------------------------------------------------------
 * Development tasks
 * --------------------------------------------------------------------------
 */
gulp.task('sass', ['sass-watch'], function() {
  return gulp.src('app/css/main.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('app/css'))
    .pipe(livereload());
});

gulp.task('sass-watch', function() {
  if (util.env.watch) {
    livereload.listen();
    gulp.watch(['app/css/**/*.scss', 'app/css/**/*.sass'], ['sass']);
  }
});

gulp.task('serve', ['config', 'sass'], function() {
  connect.server({
    root: '.',
    port: 5001,
    // livereload: true,
    fallback: 'index.html',
    middleware: function() {
      return [
        modRewrite([
          "^/img/(.*)$ /assets/img/$1",
          "^/i18n/(.*)$ /app/i18n/$1",
          "^/scan$ /assets/scan",
        ])
      ];
    }
  });
});

gulp.task('i18n.extract', function () {
  return gulp.src([
      'index.html',
      'app/components/**/*.html',
      'app/components/**/*.js',
      'app/shared/**/*.html',
      'app/shared/**/*.js'
    ])
    .pipe(gettext.extract('template.pot'))
    .pipe(gulp.dest('app/i18n/po/'));
});

gulp.task('i18n.translate', ['i18n.extract'], function () {
  return gulp.src('app/i18n/po/**/*.po')
    .pipe(gettext.compile({
      // options to pass to angular-gettext-tools...
      format: 'json'
    }))
    .pipe(gulp.dest('app/i18n/'));
});

gulp.task('i18n.copy-angular-locales', function() {
  return gulp.src([
    'bower_components/angular-i18n/angular-locale_en.js',
    'bower_components/angular-i18n/angular-locale_de.js'
  ])
  .pipe(rename(function(path) {
    path.basename = path.basename.replace('angular-locale_', '');
  }))
  .pipe(gulp.dest('app/i18n/'));
});

gulp.task('i18n', ['i18n.translate', 'i18n.copy-angular-locales']);

gulp.task('karma', ['config', 'i18n'], function(done) {
  var singleRun = !!!util.env.watch;
  new karmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: singleRun
  }, function karmaErrors(errorCode) {
    // This is to prevent those ugly gulp stacktraces when tests fail.
    if (errorCode !== 0) {
      console.log('Karma exited with error code ' + errorCode);
      done();
      return process.exit(errorCode);
    }
    done();
  }, done).start();
});

gulp.task('jscs', function() {
  return gulp.src('app/**/*.js')
  .pipe(jscs())
  .pipe(jscs.reporter());
});

gulp.task('config', function () {
  return gulp.src('app/config.json')
  .pipe(ngConfig('hq.config', {
    environment: 'production'
  }))
  .pipe(gulp.dest('app'));
});

gulp.task('test', ['config', 'karma', 'jscs']);
gulp.task('dev', ['config', 'sass', 'i18n']);


/*
 * --------------------------------------------------------------------------
 * Production tasks
 * --------------------------------------------------------------------------
 */

gulp.task('production.config', function () {
  return gulp.src('app/config.json')
  .pipe(ngConfig('hq.config', {
    environment: 'production'
  }))
  .pipe(gulp.dest('app'));
});

gulp.task('production.assets', function() {
  return gulp.src('assets/img/*')
    .pipe(gulp.dest('dist/img'));
});

gulp.task('production.i18n', ['i18n'], function() {
  return gulp.src('app/i18n/*.js*')
    .pipe(gulp.dest('dist/i18n'));
});

gulp.task('production.templatecache', function() {
  return gulp.src(['app/**/*.html'])
    .pipe(htmlmin({
      collapseWhitespace: true,
      quoteCharacter: '"',
    }))
    .pipe(ngHtml2js({
      moduleName: 'hq.templates',
      prefix: '/app/',
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('.tmp/'));
});

gulp.task('production.usemin', ['production.config', 'sass'], function() {
  return gulp.src('index.html')
    .pipe(usemin({
      jsAttributes: {
        type: 'text/javascript'
      }
    }))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('production.combineJs', ['production.usemin', 'production.templatecache'], function() {
  return gulp.src(['.tmp/app.js', '.tmp/templates.js'])
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('production.copyTmpToDist', ['production.usemin', 'production.combineJs'], function() {
  gulp.src('.tmp/style.css')
    .pipe(cssmin())
    .pipe(gulp.dest('dist'));
  gulp.src('.tmp/index.html')
    .pipe(gulp.dest('dist'));
  return del('.tmp');
});

gulp.task('production', [
  'production.i18n',
  'production.assets',
  'production.templatecache',
  'production.usemin',
  'production.combineJs',
  'production.copyTmpToDist',
]);
