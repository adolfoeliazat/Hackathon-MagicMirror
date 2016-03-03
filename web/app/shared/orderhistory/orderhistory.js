angular.module('hq.orderhistory', [])

.directive('orderHistory', function() {
    var sortDateDesc = function(dateA, dateB) {
        var keyA = new Date(dateA.timestamp);
        var keyB = new Date(dateB.timestamp);

        if (keyA > keyB) {
            return -1;
        };

        if (keyA < keyB) {
            return 1;
        };

        return 0;
    };

    return {
        templateUrl: '/app/shared/orderhistory/orderhistory.html',
        replace: true,
        restrict: 'E',
        scope: {
            events: '='
        },
        link: function($scope, $element, $attrs) {
            if ($scope.events && $scope.events instanceof Array) {
                $scope.events.sort(sortDateDesc);
            }
        }
    };
});
