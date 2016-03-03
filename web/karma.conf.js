module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'bower_components/angular/angular.js',
      'bower_components/angularjs-slider/dist/rzslider.js',
      {pattern: 'bower_components/angular-i18n/angular-locale_*.js', watched: false, included: false, served: true},
      'bower_components/angular-dynamic-locale/dist/tmhDynamicLocale.js',
      'bower_components/angular-flash-alert/dist/angular-flash.js',
      'bower_components/angular-foundation/mm-foundation-tpls.js',
      'bower_components/angular-gettext/dist/angular-gettext.js',
      'bower_components/angular-messages/angular-messages.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-scroll/angular-scroll.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/angular-ui-switch/angular-ui-switch.js',
      'bower_components/angularjs-datepicker/src/js/angular-datepicker.js',
      'bower_components/api-check/dist/api-check.js',
      'bower_components/lodash/lodash.js',
      'bower_components/restangular/dist/restangular.js',
      'bower_components/angular-formly/dist/formly.js',
      'bower_components/ui-select/dist/select.js',
      'assets/js/localstorage.js',
      'app/test/test_common.js',
      'app/**/*.js',
      'app/**/*.html',
    ],

    preprocessors: {
      '**/*.html': ['ng-html2js'],
      'app/app.js': ['coverage'],
      'app/components/**/!(test_*|home|customers).js': ['coverage'],
      'app/shared/**/!(test_*).js': ['coverage']
    },

    autoWatch : true,

    frameworks: ['jasmine', 'sinon'],

    browsers : ['PhantomJS'],

    plugins : [
      'karma-phantomjs-launcher',
      'karma-coverage',
      'karma-jasmine',
      'karma-sinon',
      'karma-junit-reporter',
      'karma-ng-html2js-preprocessor'
    ],

    junitReporter : {
      outputFile: 'reports/TESTS-xunit.xml',
      suite: 'unit'
    },

    coverageReporter: {
      type : 'lcov',
      dir : 'reports',
      subdir: function(browser) {
        return browser.toLowerCase().split(/[ /-]/)[0];
      }
    },

    ngHtml2JsPreprocessor: {
      prependPrefix: '/',
      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('foo')
      moduleName: 'test.templates'
    },
    proxies: {
      '/i18n/': '/base/app/i18n/',
      '/%7B%7BimageUrl%7D%7D': 'http://placehold.it/30',
      '/%7B%7Buser.image_url%7D%7D': 'http://placehold.it/30',
      '/img/empty.svg': 'http://placehold.it/56x50',
      '/img/warning.svg': 'http://placehold.it/60x51',

    },
    logLevel: config.LOG_WARN,
    reporters: ['coverage', 'dots', 'junit']
  });
};
