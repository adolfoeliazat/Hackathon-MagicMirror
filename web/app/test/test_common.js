// These global vars are used throughout most unit tests.
beforeEach(module('hq'));
beforeEach(module('test.templates'));
var $rootScope, $controller, $http;

function commonSetup() {
    inject(function(_$rootScope_, _$controller_, $httpBackend, Restangular, API) {
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $http = $httpBackend;
        Restangular.setBaseUrl(API.baseUrl());
    });
}
