'use strict';

describe('hq.directives', function() {
    var compile, element, scope;

    beforeEach(commonSetup);
    beforeEach(inject(function($rootScope, $compile) {
        compile = $compile;
        scope = $rootScope.$new();
    }));
});
