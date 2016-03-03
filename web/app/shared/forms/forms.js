angular.module('hq.forms', [
    'formly',
    'uiSwitch',
    'ui.select'
])

.run(function(formlyConfig, $templateCache) {
    // Field types, both standard and custom
    formlyConfig.setType({
        name: 'input',
        templateUrl: '/app/shared/forms/html/input-text.html',
        wrapper: 'floatingLabel',
    });
    formlyConfig.setType({
        name: 'email',
        templateUrl: '/app/shared/forms/html/input-email.html',
        wrapper: 'floatingLabel',
    });
    formlyConfig.setType({
        name: 'textarea',
        templateUrl: '/app/shared/forms/html/input-textarea.html',
        wrapper: 'floatingLabel',
    });
    formlyConfig.setType({
        name: 'select',
        templateUrl: '/app/shared/forms/html/select.html',
    });
    formlyConfig.setType({
        name: 'switch',
        templateUrl: '/app/shared/forms/html/switch.html',
        defaultOptions: {
            defaultValue: false
        },
    });
    formlyConfig.setType({
        name: 'radio',
        templateUrl: '/app/shared/forms/html/radio.html',
    });
    formlyConfig.setType({
        name: 'address',
        templateUrl: '/app/shared/forms/html/address.html',
    });

    // Wrappers
    formlyConfig.setWrapper({
        name: 'floatingLabel',
        templateUrl: '/app/shared/forms/html/wrapper-floating-label.html',
    });

    // Monkey-patch dropdown template to include ng-trim="false" to avoid input trimming.
    // jscs:disable
    $templateCache.put("selectize/select.tpl.html", "<div class=\"ui-select-container selectize-control single\" ng-class=\"{\'open\': $select.open}\"><div class=\"selectize-input\" ng-class=\"{\'focus\': $select.open, \'disabled\': $select.disabled, \'selectize-focus\' : $select.focus}\" ng-click=\"$select.activate()\"><div class=\"ui-select-match\"></div><input type=\"text\" autocomplete=\"false\" tabindex=\"-1\" class=\"ui-select-search ui-select-toggle\" ng-click=\"$select.toggle($event)\" placeholder=\"{{$select.placeholder}}\" ng-model=\"$select.search\" ng-trim=\"false\" ng-hide=\"!$select.searchEnabled || ($select.selected && !$select.open)\" ng-disabled=\"$select.disabled\" aria-label=\"{{ $select.baseTitle }}\"></div><div class=\"ui-select-choices\"></div></div>");
});
