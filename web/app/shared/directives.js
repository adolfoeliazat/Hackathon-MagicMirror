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
});
