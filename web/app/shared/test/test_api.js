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
            it('should be /v0/c', function() {
                expect(API.baseUrl()).toEqual('/v0/c');
            });
        });
    });
});
