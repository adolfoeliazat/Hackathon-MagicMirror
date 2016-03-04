angular.module('hq.filters', [])

.filter('inArray', function() {
    return function(array, value) {
        return array && array.indexOf(value) !== -1;
    };
})

.filter('html', function($sce) {
    return function(html) {
        return $sce.trustAsHtml(html + '');
    };
})

.filter('boolToYesNo', function(gettextCatalog) {
    return function(input) {
        return (input ? gettextCatalog.getString('yes') : gettextCatalog.getString('no'));
    };
})

.filter('link', function() {
    return function(string, url) {
        return '<a href="' + url + '">' + string + '</a>';
    };
})

.filter('mainImage', function() {
    return function(imgArr) {
        if (imgArr && (imgArr instanceof Array)) {
            var mainImg = imgArr.filter(function(image) {
                return image.is_main === true;
            });

            return mainImg.length ? mainImg[0].url : undefined;
        }
    };
})

.filter('sortChoices', function() {
    function itemStartsWith(item, query) {
        return item.value.toLowerCase().startsWith(query.toLowerCase());
    }

    function anyWordStartsWith(item, query) {
        var words = item.value.split(' ');
        res = false;
        words.map(function(word) {
            if (word.toLowerCase().startsWith(query.toLowerCase())) {
                res = true;
            }
        });
        return res;
    }

    return function(items, query) {
        if (query === undefined || query.length === 0) {
            return items;
        }

        var grouped = {
            startingWith: [],
            wordsStartingWith: [],
            substrings: [],
        };
        items.map(function(item) {
            if (itemStartsWith(item, query)) {
                grouped.startingWith.push(item);
            } else if (anyWordStartsWith(item, query)) {
                grouped.wordsStartingWith.push(item);
            } else {
                grouped.substrings.push(item);
            }
        });
        return [].concat(grouped.startingWith, grouped.wordsStartingWith, grouped.substrings);
    };
})

.filter('lastCategory', function() {
    return function(categories) {
        if (categories) {
            if (categories.constructor === Array) {
                categories = categories[categories.length - 1].path;
            } else {
                categories = categories.split(' > ');
            }

            return categories[categories.length - 1];
        }
    };
});

// Polyfill for String.startsWith, taken from
// http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}
