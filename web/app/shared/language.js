angular.module('hq.language', ['tmh.dynamicLocale'])

.config(function(tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern(
        'i18n/{{locale}}.js'
    );
})

.factory('Language', function(
    $localstorage,
    gettextCatalog,
    tmhDynamicLocale
) {
    var store = $localstorage('session');
    var availableLanguages = {
        'en': 'English',
        'de': 'Deutsch'
    };
    var defaultLanguage = 'en';

    return {
        getAvailableLanguages: function() {
            // @TODO change to fetch language list from API
            return availableLanguages;
        },
        getCurrentLanguage: function() {
            // @TODO change to fetch deafult lang from API
            return gettextCatalog.getCurrentLanguage();
        },
        getCurrentLocale: function() {
            return tmhDynamicLocale.get();
        },
        getDefaultLanguage: function() {
            return defaultLanguage;
        },
        setLanguage: function(lang) {
            lang = (this.isLanguageAvailable(lang) ? lang : this.getDefaultLanguage());

            gettextCatalog.setCurrentLanguage(lang);

            if (lang !== defaultLanguage) {
                gettextCatalog.loadRemote('/i18n/' + lang + '.json');
            }

            tmhDynamicLocale.set(lang);
            store.set('lang', lang);

            return lang;
        },
        setCurrentLanguage: function() {
            // @TODO add lang fetched from user API on top of the list
            var lang = store.get('lang') ||
                (navigator.language && navigator.language.substring(0, 2)) ||
                this.getDefaultLanguage();

            return this.setLanguage(lang);
        },

        isLanguageAvailable: function(lang) {
            if (!lang) {
                return false;
            }

            return (lang in availableLanguages);
        }
    };
});
