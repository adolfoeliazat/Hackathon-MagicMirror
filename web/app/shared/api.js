angular.module('hq.api', ['hq.config', 'restangular'])

.config(function(RestangularProvider) {
    // Handle wrapped API responses where data is one level deeper
    RestangularProvider.addResponseInterceptor(function(response, operation) {
        if (operation === 'getList') {
            var data = response.items;
            data.pagination_info = response.pagination_info;
            data.facets = response.facets;
            data.field_ranges = response.field_ranges;
            return data;
        } else {
            return response;
        }
    });
})

.factory('API', function(config, $location, $http) {
    return {
        baseUrl: function(service) {
            if (service === 'auth') {
                return this.host() + '/v0/token';
            } else {
                return this.host() + '/_/v0/hq';
            }
        },
        host: function() {
            if ($location.$$host === 'server') {
                return '';
                // This is PhantomJS; strip base URL to '/' for easier-to-type URLs.
            } else {
                return config.apiHost;
            }
        },
        get: function(url, config) {
            return $http.get(url, config);
        },
    };
});
