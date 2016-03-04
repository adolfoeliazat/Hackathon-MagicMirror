angular.module('hq.magicmirror', ['hq.config'])

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

.controller('MirrorDetailsCtrl', function($state, $stateParams, Product, $http, config) {
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

    this.requestProduct = function(product) {
        var prodDescr = product.title + ' ' +
                   product.variation_size_value + ' ' +
                   product.variation_color_value;
        $http.put(config.requestServiceHost + '/api/request/' + product.product_id, {
            value1: prodDescr,
            value2: product.images[0].url,
        }).then(function(res) {
            console.log(res);
        })
    };

    this.close = function() {
        $state.go('magicmirror.main');
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
})

.factory('ProductPoll', function($http, $interval, $rootScope, config) {
    /*
     * The barcode generators on the web add an extra digit to our 12-digit
     * product IDs, so we're stripping that here.
     */
    function toCode(code) {
        return code && code.slice(0, 12);
    }

    return {
        scannedProductId: null,
        recommendedProductId: null,
        init: function() {
            $interval(function() {
                var lastId = this.scannedProductId;
                $http.get(config.requestServiceHost + '/api/scan').then(function(res) {
                    this.scannedProductId = toCode(res.data.product_id);
                    if (lastId !== this.scannedProductId) {
                        $rootScope.$broadcast('product_scanned', this.scannedProductId)
                    }
                });
            }, 2000);

            $interval(function() {
                var lastId = this.recommendedProductId;
                $http.get(config.requestServiceHost + '/api/recommend').then(function(res) {
                    this.recommendedProductId = toCode(res.data.product_id);
                    if (lastId !== this.recommendedProductId) {
                        $rootScope.$broadcast('product_recommended', this.recommendedProductId)
                    }
                });
            }, 2000);
        }
    }
});
