'use strict';

describe('hq.auth', function() {
    beforeEach(commonSetup);

    describe('config', function() {
        var $state;

        beforeEach(inject(function(_$state_) {
            $state = _$state_;
        }));

        it('must have a route state for login', function() {
            expect($state.get('login')).toEqual(jasmine.objectContaining({
                url: '/login',
                data: {
                    public: true
                },
                name: 'login'
            }));
        });

        it('must have a route state for logout', function() {
            expect($state.get('logout')).toEqual(jasmine.objectContaining({
                url: '/logout',
                name: 'logout'
            }));
        });
    });

    describe('AuthFactory', function() {
        var Auth, $http, store, clock;
        var res = {
            access_token: '1234',
            expires_at: '2015-03-15T11:00:00.000000',
            refresh_token: 'ncntCZGF4mjXSq7sniJA4vOjeO8',
            token_type: 'dummy'
        };
        beforeEach(inject(function(_Auth_, $httpBackend, $localstorage) {
            clock = sinon.useFakeTimers(new Date('2015-03-15T10:30:00').getTime());
            Auth = _Auth_;
            $http = $httpBackend;
            store = $localstorage('session');
        }));

        afterEach(function() {
            clock.restore();
            $http.verifyNoOutstandingExpectation();
            store.remove('auth');
        });

        describe('login', function() {
            it('should post to /token', function() {
                $http.expectPOST('/v0/token').respond(200, res);
                Auth.login('testuser', 'testpass');
            });

            it('should storage access session data and email on success', function() {
                $http.expectPOST('/v0/token').respond(200, res);
                $http.expectGET('/_/v0/hq/user').respond(200, {
                    email: 'testuser',
                });
                Auth.login('testuser', 'testpass');
                $http.flush();
                expect(store.get('user').email).toEqual('testuser');
                expect(store.get('auth').access_token).toEqual('1234');
            });

            it('should return an error object on error', function() {
                $http.expectPOST('/v0/token').respond(400, {
                    error: 'unauthorized_client'
                });

                Auth.login('testuser', 'wrongpass').then(function(data) {
                    expect(data.error).toEqual('unauthorized_client');
                });
                $http.flush();
            });
        });

        describe('logout', function() {
            it('should remove auth object from localstorage', function() {
                $http.expectPOST('/v0/token').respond(200, res);
                $http.expectGET('/_/v0/hq/user').respond(200, {
                    email: 'testuser',
                });
                Auth.login('testuser', 'testpass');
                $http.flush();
                expect(store.get('user').email).toEqual('testuser');
                Auth.logout();
                expect(store.get('auth')).toBe(null);
            });
        });

        describe('loggedIn', function() {
            it('should be false initially', function() {
                expect(Auth.loggedIn()).toBeFalsy();
            });

            it('should be true if an auth object is in localstorage and expiration ' +
                'date is in future',
                function() {
                    store.set('auth', res);
                    expect(Auth.loggedIn()).toBeTruthy();
                });

            it('should be false if an auth object is in localstorage and expiration ' +
                'date is in past',
                function() {
                    store.set('auth', {
                        access_token: '1234',
                        expires_at: '2015-03-15T10:00:00.000000',
                        refresh_token: 'ncntCZGF4mjXSq7sniJA4vOjeO8',
                        token_type: 'dummy'
                    });
                    expect(Auth.loggedIn()).toBeFalsy();
                });
        });

        describe('tokenExpired', function() {
            it('should be true if token expired at 10am (UTC)', function() {
                store.set('auth', {
                    access_token: '1234',
                    expires_at: '2015-03-15T10:00:00.000000',
                    refresh_token: 'ncntCZGF4mjXSq7sniJA4vOjeO8',
                    token_type: 'dummy'
                });
                expect(Auth.tokenExpired()).toBeTruthy();
            });

            it('should be false if token expires at 11am (UTC)', function() {
                store.set('auth', {
                    access_token: '1234',
                    expires_at: '2015-03-15T11:00:00.000000',
                    refresh_token: 'ncntCZGF4mjXSq7sniJA4vOjeO8',
                    token_type: 'dummy'
                });
                expect(Auth.tokenExpired()).toBeFalsy();
            });
        });

        describe('loginRequired', function() {
            it('should be true for a state with no data object', function() {
                var state = {
                    url: '/privatestate',
                };
                expect(Auth.loginRequired(state)).toBeTruthy();
            });

            it('should be false for a state with with data.public == true', function() {
                var state = {
                    url: '/publicstate',
                    data: {
                        public: true
                    }
                };
                expect(Auth.loginRequired(state)).toBeFalsy();
            });
        });

        describe('getAccessToken', function() {
            it('should return access token if logged in', function() {
                store.set('auth', {
                    access_token: 'qwer'
                });
                expect(Auth.getAccessToken()).toEqual('qwer');
            });

            it('should return null if not logged in', function() {
                expect(Auth.getAccessToken()).toBe(null);
            });
        });

        describe('HTTP interceptors', function() {
            var rootScope;
            beforeEach(inject(function($injector) {
                rootScope = $injector.get('$rootScope');
            }));

            it('should add Authorization header when logged in', inject(function(Order) {
                store.set('auth', {
                    access_token: 'qwer'
                });
                $http.expectGET('/_/v0/hq/orders/1', undefined, function(headers) {
                    return headers['Authorization'] == 'qwer';
                }).respond(200, '');
                Order.api().get(1);
            }));

            it('should not add Authorization header when logged out', inject(function(Order) {
                $http.expectGET('/_/v0/hq/orders/1', undefined, function(headers) {
                    return headers['Authorization'] === undefined;
                }).respond(200, '');
                Order.api().get(1);
            }));

            it('should catch unauthorized requests and broadcast message', inject(function(Order) {
                $http.expectGET('/_/v0/hq/orders/1', undefined, function(headers) {
                    return headers['Authorization'] === undefined;
                }).respond(401, '');
                spyOn(rootScope, '$broadcast').and.callThrough();
                Order.api().get(1);
                $http.flush();
                expect(rootScope.$broadcast).toHaveBeenCalledWith('unauthorized');
            }));
        });
    });

    describe('LoginCtrl', function() {
        var ctrl, scope;

        beforeEach(function() {
            scope = $rootScope.$new();
            ctrl = $controller('LoginCtrl', {
                $scope: scope
            });
        });

        describe('isSubmitDisabled', function() {
            it('should return true when form is invalid', function() {
                ctrl.loginForm = {
                    $invalid: true
                };

                expect(ctrl.isSubmitDisabled()).toBeTruthy();
            });

            it('should return true when form is valid but busy', function() {
                ctrl.loginForm = {
                    $invalid: false
                };
                ctrl.busy = true;

                expect(ctrl.isSubmitDisabled()).toBeTruthy();
            });

            it('should return false when form is valid', function() {
                ctrl.loginForm = {
                    $invalid: false
                };

                expect(ctrl.isSubmitDisabled()).toBeFalsy();
            });
        });

        describe('isLoading', function() {
            it('should return true when form is busy', function() {
                ctrl.busy = true;

                expect(ctrl.isLoading()).toBeTruthy();
            });

            it('should false true when form is not busy', function() {
                ctrl.busy = false;

                expect(ctrl.isLoading()).toBeFalsy();
            });
        });

        describe('login', function() {
            it('should return undefined if form is busy', function() {
                ctrl.busy = true;

                expect(ctrl.login()).toBeUndefined();
            });

            it('should show busy indicator during login', function() {
                $http.expectPOST('/v0/token').respond(200, {
                    access_token: '',
                    email: ''
                });
                $http.expectGET('/_/v0/hq/user').respond(200, {
                    email: 'user',
                });
                ctrl.login('user', 'pass');
                expect(ctrl.busy).toBeTruthy();
                $http.flush();
                expect(ctrl.busy).toBeFalsy();
            });

            it('should redirect after successful login', inject(function($location, $timeout) {
                $http.expectPOST('/v0/token').respond(200, {
                    access_token: '1234',
                    email: ''
                });
                $http.expectGET('/_/v0/hq/user').respond(200, {
                    email: 'user',
                });
                ctrl.splashScreenDuration = 0;
                ctrl.login('user', 'pass');
                $http.flush();
                // Wait for splash screen to finish.
                $timeout(function() {
                    expect($location.path()).toEqual('/distributions/stores/list');
                }, 1);
            }));

            it(
                'should show welcome screen after successful login',
                inject(function($location, $timeout) {
                    $http.expectPOST('/v0/token').respond(200, {
                        access_token: '1234',
                        email: ''
                    });
                    $http.expectGET('/_/v0/hq/user').respond(200, {
                        email: 'user',
                    });
                    ctrl.splashScreenDuration = 1;
                    expect(ctrl.loginSuccessful).toBeFalsy();
                    ctrl.login('user', 'pass');
                    $http.flush();
                    expect(ctrl.loginSuccessful).toBeTruthy();
                    // Wait for splash screen to finish.
                    $timeout(function() {
                        expect($location.path()).toEqual('/distributions/stores/list');
                    }, 2);
                })
            );

            it('should show error message after failed login', function() {
                $http.expectPOST('/v0/token').respond(400, {
                    error: 'unauthorized_client'
                });
                ctrl.login('user', 'wrongpass');
                $http.flush();
                expect(ctrl.loginError).toEqual({
                    unauthorized: true
                });
            });
        });

        describe('clearErrorMsg', function() {
            it('should remove loginError from controller', function() {
                ctrl.loginError = 'something';
                ctrl.clearErrorMsg();
                expect(ctrl.loginError).toBeUndefined();
            });
        });
    });

    describe('LogoutCtrl', function() {
        var ctrl, scope, Auth;

        beforeEach(inject(function(_Auth_) {
            Auth = _Auth_;
            spyOn(Auth, 'logout');
            scope = $rootScope.$new();
            ctrl = $controller('LogoutCtrl', {
                $scope: scope
            });
        }));

        it('should logout on initialization', function() {
            expect(Auth.logout).toHaveBeenCalled();
        });
    });
});
