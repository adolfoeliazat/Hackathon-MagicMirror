angular.module('hq.magicmirror', [])

.config(function($stateProvider) {
    $stateProvider
        .state('magicmirror', {
            url: '/',
            abstract: true,
            views: {
                'main': {
                    templateUrl: '/app/components/magicmirror/html/index.html',
                }
            },
        })
        .state('magicmirror.main', {
            url: '',
            views: {
                'main': {
                    templateUrl: '/app/components/magicmirror/html/main.html',
                    controller: 'MirrorCtrl as ctrl',
                }
            }
        })
        .state('magicmirror.browser', {
            url: 'browse',
            views: {
                'main': {
                    templateUrl: '/app/components/magicmirror/html/browser.html',
                    controller: 'MirrorBrowser as ctrl',
                }
            }
        })
        .state('magicmirror.details', {
            url: ':productId/:catalog/:locale',
            views: {
                'main': {
                    templateUrl: '/app/components/magicmirror/html/details.html',
                    controller: 'MirrorDetailsCtrl as detailsCtrl',
                }
            },
        });
})

.controller('MirrorCtrl', function(Product) {})

.controller('MirrorBrowser', function(Product) {
    this.products = Product.api().getList({
        catalog: 'storefront-catalog-en',
        locale: 'en-US'
    }).$object;
})

.controller('MirrorDetailsCtrl', function($state, $stateParams, gettextCatalog, Product) {
    this.product = Product.one(
        $stateParams.productId,
        $stateParams.catalog,
        $stateParams.locale
    ).$object;

    this.variationUrl = function(productId) {
        return $state.href('magicmirror.details', {
            productId: productId,
            catalog: $stateParams.catalog,
            locale: $stateParams.locale
        });
    };
})

.factory('Product', function($state, Restangular) {
    Restangular.extendModel('products', function(model) {
        model.url = function() {
            return $state.href('magicmirror.details', {
                productId: this.product_id,
                catalog: 'storefront-catalog-en',
                locale: 'en-US'
            });

        };
        return model;
    });

    return {
        api: function() {
            return Restangular.all('products');
        },
        one: function(productId, catalog, locale) {
            return Restangular.one('products', productId).get({
                catalog: catalog,
                locale: locale
            });
        }
    };
});
