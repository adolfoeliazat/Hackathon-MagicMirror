angular.module('hq.directives', [])

.directive('submitButton', function() {
    return {
        template: '<button ng-click="click()" ng-disabled="disabled()" type="submit" translate>' +
            '<span ng-class="{\'hidden\' : load()}">' +
            '{{label}}' +
            '<span ng-show="load()" class="button-spinner"></span>' +
            '</span>' +
            '</button>',
        restrict: 'E',
        scope: {
            label: '=',
            click: '=',
            disabled: '=',
            load: '='
        }
    };
})

.directive('userMenuLink', function($localstorage) {
    return {
        template: '<a href="#" class="top-bar-dropdown-link" translate>' +
            '  <user-avatar class="thumb30" ng-if="user" user="user"></user-avatar>' +
            '  <span class="greet">Hi, {{userFirstName}}!</span>' +
            '</a>',
        replace: true,
        link: function($scope) {
            $scope.user = $localstorage('session').get('user');
            $scope.userFirstName = $scope.user.first_name || $scope.user.last_name || 'User';
        }
    };
})

.directive('userAvatar', function($compile, UserAvatar) {
    return {
        restrict: 'E',
        scope: {
            user: '=',
            mini: '='
        },
        link: function($scope, $element) {
            $element.html(UserAvatar.getHTML($scope.user));
            $compile($element.contents())($scope);
        }
    };
})

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

.directive('itemDetail', function($sce) {
    return {
        restrict: 'E',
        template: '<dt ng-show="value">{{label}}</dt>' +
            '<dd ng-class="class" ng-show="value" ng-bind-html="htmlValue"></dd>',
        scope: {
            label: '=',
            value: '=',
            class: '='
        },
        link: function($scope) {
            $scope.$watch('value', function(value) {
                $scope.htmlValue = $sce.trustAsHtml(value + '');
            });
        }
    };
})

.directive('itemDetailLink', function() {
    return {
        restrict: 'E',
        template: '<dt ng-show="value">{{label}}</dt>' +
            '<dd ng-class="class" ng-show="value"><a href="{{link}}">{{value}}</a></dd>',
        scope: {
            label: '=',
            value: '=',
            link: '=',
            class: '='
        }
    };
})

.directive('itemDetailEmail', function() {
    return {
        restrict: 'E',
        template: '<dt ng-show="value">{{label}}</dt>' +
            '<dd ng-class="class" ng-show="value">' +
            '<a href="mailto:{{email}}">&#x2192; {{value}}</a>' +
            '</dd>',
        scope: {
            label: '=',
            value: '=',
            email: '=',
            class: '='
        }
    };
})

.directive('itemDetailAddress', function(countries) {
    return {
        restrict: 'E',
        template: '<dt ng-show="address">{{label}}</dt>' +
            '<dd ng-class="class" ng-show="address">' +
            '{{address.street_number}} {{address.street}}<br/>' +
            '{{address.city}}, {{address.state}} {{address.zip_code}}<br/>' +
            '{{countries[address.country_code]}}' +
            '</dd>',
        scope: {
            label: '=',
            address: '=',
            class: '='
        },
        link: function($scope) {
            $scope.countries = countries;
        }
    };
})

.directive('itemDetailBadge', function() {
    return {
        restrict: 'E',
        template: '<dt ng-show="value">{{label}}</dt>' +
            '<dd ng-class="class" ng-show="value">' +
            '<span class="badge status-{{value}}">{{value}}</span>' +
            '</dd>',
        scope: {
            label: '=',
            value: '=',
            class: '='
        }
    };
})

.directive('checkbox', function() {
    return {
        template: '<span class="checkbox-container">' +
            '  <input ng-model="model" type="checkbox"/>' +
            '  <span class="box"><span class="tick"></span></span>' +
            '</span>',
        scope: {
            model: '='
        }
    };
});
