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

    describe('statusBadge', function() {
        it('should display a status string as badge', inject(function(statusBadgeFilter) {
            expect(statusBadgeFilter('picked_up').toString()).toEqual(
                '<span class="badge  status-picked_up">Picked Up</span>'
            );
        }));

        it('should display a badge with custom class', inject(function(statusBadgeFilter) {
            expect(statusBadgeFilter('picked_up', 'custom-class').toString()).toEqual(
                '<span class="badge custom-class status-picked_up">Picked Up</span>'
            );
        }));

        it(
            'should display badge with custom class and safe HTML',
            inject(function(statusBadgeFilter) {
                expect(statusBadgeFilter('picked_up', 'custom-class', true).toString()).toEqual(
                    '<span class="badge custom-class status-picked_up">Picked Up</span>'
                );
            })
        );

        it('should return undefined for undefined input', inject(function(statusBadgeFilter) {
            expect(statusBadgeFilter(undefined)).toBeUndefined();
        }));

        it('should return input string if value is not known', inject(function(statusBadgeFilter) {
            expect(statusBadgeFilter('unknown_value').toString()).toEqual(
                '<span class="badge  status-unknown_value">unknown_value</span>'
            );
        }));
    });

    describe('money', function() {
        it('should place th $ symbol when currency is USD',
            inject(function(moneyFilter) {
                expect(moneyFilter(12.34, 'USD')).toEqual('$12.34');
            })
        );

        it('should place the € symbol when currency is EUR',
            inject(function(moneyFilter) {
                expect(moneyFilter(12.34, 'EUR')).toEqual('€12.34');
            })
        );

        it('should format currency according to locale "en"',
            inject(function(moneyFilter) {
                Language.setLanguage('en', function() {
                    expect(moneyFilter(12.34, 'USD')).toEqual('$12.34');
                });
            })
        );

        it('should format currency according to locale "de"',
            inject(function(moneyFilter) {
                $http.expectGET('/i18n/de.json').respond(200);
                Language.setLanguage('de', function() {
                    expect(moneyFilter(12.34, 'EUR')).toEqual('12,34 €');
                });
            })
        );

        it('should place currency code before amount when currency symbol is not defined',
            inject(function(moneyFilter) {
                Language.setLanguage('en', function() {
                    expect(moneyFilter(1234, 'JPY')).toEqual('JPY1,234.00');
                });
            })
        );

        it('should display two decimal places always',
            inject(function(moneyFilter) {
                Language.setLanguage('en', function() {
                    expect(moneyFilter(12, 'USD')).toEqual('$12.00');
                });
            })
        );

        it('should not fail on undefined input',
            inject(function(moneyFilter) {
                expect(moneyFilter()).toBeUndefined();
            })
        );
    });

    describe('time', function() {
        it('should convert a time string into a different time string',
            inject(function(Language, timeFilter) {
                Language.setLanguage('en', function() {
                    expect(timeFilter('10:00', 'hh:mma')).toEqual('10:00am');
                });
            })
        );
    });

    describe('days', function() {
        it('should represent a single Sunday-0-indexed value as a string',
            inject(function(daysFilter, Language) {
                Language.setLanguage('en', function() {
                    expect(daysFilter([0])).toEqual('Sunday');
                });
            })
        );

        it('should represent a single Sunday-0-indexed value as a locale-aware string',
            inject(function(daysFilter, Language) {
                $http.expectGET('/i18n/de.json').respond(200);
                Language.setLanguage('de', function() {
                    expect(daysFilter([0])).toEqual('Sonntag');
                });
            })
        );

        it('should print an interval', inject(function(daysFilter, Language) {
            $http.expectGET('/i18n/en.json').respond(200);
            Language.setLanguage('en', function() {
                expect(daysFilter([0, 1, 2, 3])).toEqual('Sunday - Wednesday');
            });
        }));
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

    describe('percent', function() {
        it('should format simple floats', inject(function(percentFilter) {
            expect(percentFilter(.1)).toEqual('10%');
        }));
    });

    describe('displayName', function() {
        it('should transform an object containing first_name and last_name to ' +
            '"<last_name>, <first_name>"', inject(function(displayNameFilter) {
                var nameObj = {
                    first_name: 'John',
                    last_name: 'Doe',
                };
                expect(displayNameFilter(nameObj)).toEqual('Doe, John');
            })
        );

        it('should transform an object containing even partly missing props to ""',
            inject(function(displayNameFilter) {
                var nameObj = {
                    first_name: undefined,
                    last_name: 'Doe',
                };
                expect(displayNameFilter(nameObj)).toBe('');
            })
        );

        it('should not fail for undefined', inject(function(displayNameFilter) {
            expect(displayNameFilter(undefined)).toBe('');
        }));
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

    describe('userAvatar', function() {
        it('should display an <img> element', inject(function(userAvatarFilter) {
            var user = {
                first_name: 'John',
                last_name: 'Doe',
                image_url: 'http://placehold.it/40',
            };
            expect(userAvatarFilter(user)).
            toEqual('<img class="circular-thumb" src="http://placehold.it/40" />');
        }));

        it('should display an <span> element with the initials', inject(function(userAvatarFilter) {
            var user = {
                first_name: 'John',
                last_name: 'Doe',
            };
            expect(userAvatarFilter(user)).
            toEqual('<span class="circular-initials">JD</span>');
        }));

        it('should display an <span> element with one initial', inject(function(userAvatarFilter) {
            var user = {
                first_name: 'John',
            };
            expect(userAvatarFilter(user)).
            toEqual('<span class="circular-initials">J</span>');
        }));

        it(
            'should display an <span> element with the letter "u"',
            inject(function(userAvatarFilter) {
                var user = {
                    foo: 'bar',
                };
                expect(userAvatarFilter(user)).
                toEqual('<span class="circular-initials">u</span>');
            })
        );
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

    describe('avatar', function() {
        it('should return <img> element properly set', inject(
            function(avatarFilter) {
                expect(avatarFilter('http://placehold.it/30')).
                toEqual('<img src="http://placehold.it/30" class="circular-thumb"/>');
            })
        );

        it('should return undefined if the input is null', inject(
            function(avatarFilter) {
                expect(avatarFilter(null)).
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
