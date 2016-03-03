'use strict';

describe('hq.language', function() {
    beforeEach(commonSetup);

    describe('Language', function() {
        var Language, store, $http;
        beforeEach(inject(function(_Language_, $localstorage, $httpBackend) {
            Language = _Language_;
            $http = $httpBackend;
            store = $localstorage('session');
        }));

        afterEach(function() {
            store.remove('lang');
        });

        describe('getAvailableLanguages', function() {
            it('should return an object with 2 languages', function() {
                var expectedAvailableLanguages = {
                    'en': 'English',
                    'de': 'Deutsch'
                };

                expect(Language.getAvailableLanguages()).toEqual(expectedAvailableLanguages);
            });
        });

        describe('getCurrentLanguage', function() {
            it('should return the gettext default language ("en")', function() {
                expect(Language.getCurrentLanguage()).toBe('en');
            });

            it('should return the language "de", after setting it accordingly', function() {
                $http.expectGET('/i18n/de.json').respond(200);
                Language.setLanguage('de');
                expect(Language.getCurrentLanguage()).toBe('de');
                expect(Language.getCurrentLocale()).toBe('de');
            });
        });

        describe('getDefaultLanguage', function() {
            it('should return the default language ("en")', function() {
                expect(Language.getDefaultLanguage()).toBe('en');
            });
        });

        describe('setLanguage', function() {
            it('should set the language to "de" and return it', function() {
                $http.expectGET('/i18n/de.json').respond(200);
                var lang = Language.setLanguage('de');
                expect(Language.getCurrentLanguage()).toBe('de');
                expect(Language.getCurrentLocale()).toBe('de');
                expect(lang).toBe('de');
            });
        });

        // @TODO change this test to mock the user API
        describe('setCurrentLanguage', function() {
            var $window, navigator;

            beforeEach(inject(function(_$window_) {
                $window = _$window_;

                navigator = $window.navigator;
            }));

            afterEach(function() {
                $window.navigator = navigator;
            });

            it(
                'should set the language to the localstorage value ("en") and return it',
                function() {
                    store.set('lang', 'en');

                    var lang = Language.setCurrentLanguage();
                    expect(Language.getCurrentLanguage()).toBe('en');
                    expect(Language.getCurrentLocale()).toBe('en');
                    expect(lang).toBe('en');
                }
            );

            it('should return the value from browser', function() {
                store.remove('lang');

                var lang = Language.setCurrentLanguage();
                expect(Language.getCurrentLanguage()).toBe('en');
                expect(Language.getCurrentLocale()).toBe('en');
                expect(lang).toBe('en');
            });

            it('should return the default language', function() {
                store.remove('lang');

                $window.navigator = {
                    language: null
                };

                var lang = Language.setCurrentLanguage();

                expect(Language.getCurrentLanguage()).toBe('en');
                expect(Language.getCurrentLocale()).toBe('en');
                expect(lang).toBe('en');
            });
        });

        describe('isLanguageAvailable', function() {
            it('should return true when checking "en"', function() {
                expect(Language.isLanguageAvailable('en')).toBeTruthy;
            });

            it('should return false when checking "it"', function() {
                expect(Language.isLanguageAvailable('it')).toBeFalsy;
            });
        });
    });
});
