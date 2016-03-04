describe('hq', function() {
    beforeEach(commonSetup);

    describe('AppCtrl', function() {
        var $http, ctrl, scope, state, location, store, clock;

        beforeEach(inject(function($httpBackend, $location, $localstorage, $state) {
            clock = sinon.useFakeTimers(new Date('2015-03-15T10:30:00').getTime());
            store = $localstorage('session');
            ctrl = $controller('AppCtrl', {
                $scope: $rootScope.$new()
            });
            state = $state;
            location = $location;
            $http = $httpBackend;
        }));

        afterEach(function() {
            clock.restore();
            $http.verifyNoOutstandingExpectation();
        });
    });
});
