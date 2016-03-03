'use strict';

describe('hq.api', function() {
    beforeEach(commonSetup);

    describe('API', function() {
        var API, location;
        beforeEach(inject(function(_API_, $location) {
            location = $location;
            API = _API_;
        }));

        describe('baseUrl', function() {
            it('should be /_/v0/hq for other services', function() {
                expect(API.baseUrl()).toEqual('/_/v0/hq');
            });

            it('should be /v0/token for auth', function() {
                expect(API.baseUrl('auth')).toEqual('/v0/token');
            });
        });
    });
});
