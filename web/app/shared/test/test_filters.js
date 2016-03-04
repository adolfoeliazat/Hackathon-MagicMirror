'use strict';

describe('hq.filters', function() {
    var Language, $http;

    beforeEach(commonSetup);
    beforeEach(inject(function(_Language_, $httpBackend) {
        Language = _Language_;
        $http = $httpBackend;
    }));

    describe('inArray', function() {
        it('should return false if array is invalid',
            inject(function(inArrayFilter) {
                expect(inArrayFilter(null, 'value')).toBeFalsy();
            })
        );

        it('should return false if value is not in array',
            inject(function(inArrayFilter) {
                expect(inArrayFilter(['foo', 'bar'], 'baz')).toBeFalsy();
            })
        );

        it('should return true if value is in array',
            inject(function(inArrayFilter) {
                expect(inArrayFilter(['foo', 'bar'], 'bar')).toBeTruthy();
            })
        );
    });

    describe('boolToYesNo', function() {
        it('should transform true to "Yes"',
            inject(function(boolToYesNoFilter) {
                expect(boolToYesNoFilter(true)).toEqual('yes');
            })
        );

        it('should transform false to "No"',
            inject(function(boolToYesNoFilter) {
                expect(boolToYesNoFilter(false)).toEqual('no');
            })
        );
    });

    describe('link', function() {
        it('should wrap a string into an <a> tag', inject(function(linkFilter) {
            expect(linkFilter('some string', '/orders/1234')).
            toEqual('<a href="/orders/1234">some string</a>');
        }));
    });

    describe('sortChoices', function() {
        var items = [{
            key: 1,
            value: 'Ajohja'
        }, {
            key: 2,
            value: 'Don Johnson'
        }, {
            key: 3,
            value: 'John Cleese'
        }];

        it('should group matched items according to rules', inject(function(sortChoicesFilter) {
            expect(sortChoicesFilter(items, 'joh')).toEqual([{
                    key: 3,
                    value: 'John Cleese'
                }, // Items that start with query
                {
                    key: 2,
                    value: 'Don Johnson'
                }, // Items containing words that start with query
                {
                    key: 1,
                    value: 'Ajohja'
                }, // Other matches (middle-of-word)
            ]);
        }));

        it('should not modify array if query is empty string', inject(function(sortChoicesFilter) {
            expect(sortChoicesFilter(items, '')).toEqual(items);
        }));

        it('should not modify array if query is undefined', inject(function(sortChoicesFilter) {
            expect(sortChoicesFilter(items, undefined)).toEqual(items);
        }));
    });

    describe('mainImage', function() {
        it('should return the url the correct item in the given array', inject(
            function(mainImageFilter) {
                var images = [{
                    url: 'http://placehold.it/30',
                    is_main: false,
                }, {
                    url: 'http://placehold.it/20',
                    is_main: true,
                }];
                expect(mainImageFilter(images)).
                toEqual('http://placehold.it/20');
            })
        );

        it('should return undefined if no image is set as main', inject(
            function(mainImageFilter) {
                var images = [{
                    url: 'http://placehold.it/30',
                    is_main: false,
                }];
                expect(mainImageFilter(images)).
                toBeUndefined;
            })
        );

        it('should return undefined if the input is not a valid array', inject(
            function(mainImageFilter) {
                var images = 'test';
                expect(mainImageFilter(images)).
                toBeUndefined;
            })
        );

        it('should return undefined if the input is null', inject(
            function(mainImageFilter) {
                var images = null;
                expect(mainImageFilter(images)).
                toBeUndefined;
            })
        );
    });

    describe('lastCategory', function() {
        it('should return the last category of a splitted string', inject(
            function(lastCategoryFilter) {
                expect(lastCategoryFilter('Category > Sub Category > Last Category')).
                toEqual('Last Category');
            })
        );

        it('should return the last category of the path of the single element of the array', inject(
            function(lastCategoryFilter) {
                var categories = [{
                    'path': ['Womens', 'Jewelry', 'Necklaces']
                }];
                expect(lastCategoryFilter(categories)).
                toEqual('Necklaces');
            })
        );

        it('should return the last category of the path of the last element of the array', inject(
            function(lastCategoryFilter) {
                var categories = [{
                    'path': ['Womens', 'Jewelry', 'Necklaces']
                }, {
                    'path': ['Womens', 'Jewelry', 'Bracelets']
                }];
                expect(lastCategoryFilter(categories)).
                toEqual('Bracelets');
            })
        );

        it('should return the input if no separators are present', inject(
            function(lastCategoryFilter) {
                expect(lastCategoryFilter('Only Category')).
                toEqual('Only Category');
            })
        );

        it('should return undefined if the input is null', inject(
            function(lastCategoryFilter) {
                expect(lastCategoryFilter(null)).
                toBeUndefined;
            })
        );
    });
});
