angular.module('hq.auth', ['ngMessages'])

.config(function($httpProvider, $stateProvider, $urlMatcherFactoryProvider) {
    $urlMatcherFactoryProvider.strictMode(false);
    $stateProvider.state('login', {
        url: '/login',
        data: {
            public: true
        },
        views: {
            'main': {
                controller: 'LoginCtrl as login',
                templateUrl: '/app/components/auth/html/login.html',
            }
        }
    });
    $stateProvider.state('logout', {
        url: '/logout',
        views: {
            'main': {
                controller: 'LogoutCtrl',
            },
        },
    });

    $httpProvider.interceptors.push(function($rootScope, Auth, $q) {
        return {
            request: function(config) {
                if (Auth.loggedIn()) {
                    config.headers.Authorization = Auth.getAccessToken();
                }
                return config;
            },

            responseError: function(rejection) {
                if (rejection.status === 401) {
                    $rootScope.$broadcast('unauthorized');
                }
                return $q.reject(rejection);
            }
        };
    });
})

.factory('Auth', function($localstorage, $q, $injector) {
    var store = $localstorage('session');

    function tokenExpired() {
        var expiration = new Date(store.get('auth').expires_at);
        var now = new Date();
        return expiration < now;
    }

    return {
        tokenExpired: tokenExpired,

        login: function(email, password) {
            var res = $q.defer();
            $injector.get('$http').post(
                $injector.get('API').baseUrl('auth'),
                // Legacy compat quickfix: Flask expects valid JSON as body, cf.
                // https://goodscloud.atlassian.net/browse/OC-217.
                {}, {
                    headers: {
                        'Email': email,
                        'Password': password,
                    },
                }
            ).success(function(data) {
                store.set('auth', data);
                $injector.get('$http').get($injector.get('API').baseUrl() + '/user')
                    .success(function(user) {
                        data.user = user;
                        store.set('user', user);
                        res.resolve(data);
                    });
            }).error(function(data) {
                res.resolve(data);
            });
            return res.promise;
        },

        logout: function() {
            store.remove('auth');
        },

        loginRequired: function(state) {
            return !(state.data && state.data.public);
        },

        getAccessToken: function() {
            var auth = store.get('auth');
            return auth && auth.access_token;
        },

        loggedIn: function() {
            var auth = store.get('auth');
            return angular.isObject(auth) && !tokenExpired();
        },

        updateUser: function() {
            $injector.get('$http').get($injector.get('API').baseUrl() + '/user')
                .success(function(user) {
                    store.set('user', user);
                });
        },
    };
})

.controller('LoginCtrl', function($state, $timeout, Auth) {
    if (Auth.loggedIn()) {
        $state.go('distributions.stores.list');
    }

    var self = this;
    $state.current.name = 'login';
    self.splashScreenDuration = 2000;

    this.isSubmitDisabled = function() {
        return (self.loginForm && self.loginForm.$invalid) || self.busy;
    };

    this.isLoading = function() {
        return self.busy;
    };

    this.login = function(email, password) {
        if (self.busy) {
            return;
        }

        self.busy = true;
        self.loginError = undefined;
        Auth.login(email, password).then(function(data) {
            self.busy = false;
            if (data && data.access_token) {
                self.userFirstName = data.user.first_name;
                self.loginSuccessful = true;
                $timeout(function() {
                    $state.go('distributions.stores.list');
                }, self.splashScreenDuration);
                return;
            }
            if (data && data.error === 'unauthorized_client') {
                self.loginError = {
                    unauthorized: true
                };
            } else {
                self.loginError = {
                    otherFailure: true
                };
            }
        });
    };

    this.clearErrorMsg = function() {
        self.loginError = undefined;
    };
})

.controller('LogoutCtrl', function($state, Auth) {
    Auth.logout();
    $state.go('login');
});
