'use strict';

// Declare app level module which depends on views, and components
angular.module('hq', [
    'gettext',
    'flash',
    'localstorage',
    'mm.foundation',
    'ui.router',

    'hq.api',
    'hq.constants',
    'hq.directives',
    'hq.filters',
    'hq.language',
    'hq.templates',
    'hq.magicmirror',
])

.config(function($locationProvider, $stateProvider, $urlRouterProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $urlRouterProvider.otherwise('/not-found');

    $stateProvider.state('404', {
        url: '/not-found',
        data: {
            public: true
        },
        views: {
            main: {
                template: 'Sorry, we couldn\'t find that page.'
            }
        }
    });
})

// App-wide controller with general functions and data
.controller('AppCtrl', function(
    $rootScope,
    $state,
    API,
    Restangular,
    ProductPoll
) {
    Restangular.setBaseUrl(API.baseUrl());
    var poll = ProductPoll.init();
    $rootScope.$on('product_scanned', function(msg, productId) {
        console.log('Product scanned: ', productId);
        productId && $state.go('magicmirror.details', {
            productId: productId,
            catalog: 'storefront-catalog-en',
            locale: 'en-US'
        });
    });

    $rootScope.$on('product_recommended', function(msg, productId) {
        console.log('Product recommended: ', productId);
        productId && $state.go('magicmirror.details', {
            productId: productId,
            catalog: 'storefront-catalog-en',
            locale: 'en-US'
        });
    });
});

// Mock out template cache module (gets redefined in app.js upon production build).
angular.module('hq.templates', []);
