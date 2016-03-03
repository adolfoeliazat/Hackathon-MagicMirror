angular.module('hq.filters', [])

.filter('inArray', function() {
    return function(array, value) {
        return array && array.indexOf(value) !== -1;
    };
})

.filter('statusBadge', function($sce, orderStates) {
    return function(statusString, classes, isSafe) {
        classes = classes || '';
        var formatted = orderStates[statusString] || statusString;

        if (formatted) {
            badgeHtml = '<span class="badge ' + classes + ' status-' + statusString + '">' +
                formatted +
                '</span>';
            if (isSafe) {
                return formatted && $sce.trustAsHtml(badgeHtml);
            } else {
                return formatted && badgeHtml;
            }
        }
    };
})

.filter('money', function($injector, currencySymbols, constants) {
    var $filter = $injector.get('$filter');
    var currencyFilter = $filter('currency');

    return function(amount, currency) {
        var currencySymbol = (currencySymbols[currency]) ?
            currencySymbols[currency] :
            currencySymbols[constants.defaultCurrency];
        return (amount && currencySymbol) ? currencyFilter(amount, currencySymbol, 2) : undefined;
    };
})

.filter('time', function($injector) {
    var $filter = $injector.get('$filter');
    var dateFilter = $filter('date');

    return function(timeString, formatString) {
        return dateFilter(
            new Date('1970-01-01T' + timeString),
            formatString,
            '+0000').toLowerCase();
    };
})

.filter('days', function($injector) {
    var $filter = $injector.get('$filter');
    var dateFilter = $filter('date');

    function toDayString(day) {
        var d = new Date('1979-01-01T00:00:00');
        d.setDate(day);
        return dateFilter(d, 'EEEE', '+0000');
    }

    return function(days) {
        if (days.length === 1) {
            return toDayString(days[0]);
        } else {
            return toDayString(days[0]) + ' - ' + toDayString(days[days.length - 1]);
        }
    };
})

.filter('percent', function() {
    return function(number) {
        return Math.round(number * 100) + '%';
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

.filter('displayName', function() {
    return function(inputObj) {
        return inputObj && inputObj['first_name'] && inputObj['last_name'] &&
            inputObj['last_name'] + ', ' + inputObj['first_name'] || '';
    };
})

.filter('userAvatar', function(UserAvatar) {
    return function(inputObj) {
        return UserAvatar.getHTML(inputObj);
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

.filter('avatar', function() {
    return function(imgSrc) {
        if (imgSrc) {
            return '<img src="' + imgSrc + '" class="circular-thumb"/>';
        }
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
