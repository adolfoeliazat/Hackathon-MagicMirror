angular.module('hq.directives', [])

.directive('backLink', function($window) {
    return {
        replace: true,
        template: '<a class="back-link">&#8592;</a>',
        link: function($scope, $elem) {
            $elem.bind('click', function() {
                $window.history.back();
            });
        },
    };
})

.directive('uiSrefActiveIf', function($state) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            var state = $attrs.uiSrefActiveIf;

            function update() {
                if ($state.includes(state) || $state.is(state)) {
                    $element.addClass('active');
                } else {
                    $element.removeClass('active');
                }
            }

            $scope.$on('$stateChangeSuccess', update);
            update();
        }
    };
})

.directive('sizeAndColor', function($state, $stateParams) {
    return {
        template: '<ul class="left">'+
                      '<li ng-repeat="color in colors">'+
                          '<a ng-class="{active : selectedColor===color}" ng-click="selectColor(color)">{{color}}</a>'+
                      '</li>'+
                  '</ul>'+
                  '<ul ng-show="selectedColor" class="right">'+
                      '<li ng-repeat="size in sizes">'+
                          '<a href="{{size.url}}">{{size.size}}</a>'+
                      '</li>'+
                  '</ul>',
        restrict: 'E',
        scope: {
            colors: '=',
            variations: '='
        },
        link: function($scope, $element, $attrs) {
            $scope.selectColor = function(color) {
                $scope.selectedColor = color;
                $scope.sizes = [];

                $scope.variations.map(function(variation) {
                    if (variation.variation_color_value === color) {
                        $scope.sizes.push({
                            size: variation.variation_size_value,
                            url: variationUrl(variation.product_id)
                        });
                    }
                });
            }

            var variationUrl = function(productId) {
                return $state.href('magicmirror.details', {
                    productId: productId,
                    catalog: $stateParams.catalog,
                    locale: $stateParams.locale
                });
            };
        },
    };
});
