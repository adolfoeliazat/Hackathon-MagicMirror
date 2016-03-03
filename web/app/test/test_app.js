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
            store.remove('auth');
        });

        describe('when user details are fetched', function() {
            it('should store them in session', function() {
                $http.expectGET('/_/v0/hq/user').respond(200, {
                    email: 'user@example.com',
                });
                $http.flush();
                expect(store.get('user').email).toEqual('user@example.com');
            });
        });

        describe('when logged in', function() {
            it('should redirect to /', function() {
                store.set('auth', {
                    access_token: '1234',
                    expires_at: '2015-03-15T11:00:00.000000',
                    refresh_token: 'ncntCZGF4mjXSq7sniJA4vOjeO8',
                    token_type: 'dummy'
                });
                $rootScope.$digest();
                expect(location.path()).toEqual('/');
                expect(ctrl.showNavigation()).toBeTruthy();
            });
        });

        describe('when logged out', function() {
            it('should redirect to /login', function() {
                store.remove('auth');
                $rootScope.$digest();
                expect(location.path()).toEqual('/login');
                expect(ctrl.showNavigation()).toBeFalsy();
            });
        });

        describe('when unauthorized', function() {
            it('should redirect to /login', function() {
                $rootScope.$broadcast('unauthorized');
                $rootScope.$digest();
                expect(location.path()).toEqual('/login');
                expect(ctrl.showNavigation()).toBeFalsy();
            });
        });
    });
});
