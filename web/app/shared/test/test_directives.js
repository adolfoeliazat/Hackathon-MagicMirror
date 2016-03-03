'use strict';

describe('hq.directives', function() {
    var compile, element, scope;

    beforeEach(commonSetup);
    beforeEach(inject(function($rootScope, $compile) {
        compile = $compile;
        scope = $rootScope.$new();
    }));

    describe('submitButton', function() {
        beforeEach(function() {
            element = '<submit-button label="\'testLabel\'" click="alert"' +
                'disabled="alert" load="alert">' +
                '</submit-button>';
            element = compile(element)(scope);
            scope.$digest();
        });
        it('should contain the scope elements with correct values', function() {
            expect(element.find('span').text()).toEqual('testLabel');
        });
    });

    describe('itemDetail', function() {
        beforeEach(function() {
            element = '<item-detail label="\'testLabel\'" value="\'testValue\'"></item-detail>';
            element = compile(element)(scope);
            scope.$digest();
        });
        it('should contain the description elements with correct values', function() {
            expect(element.find('dt').text()).toEqual('testLabel');
            expect(element.find('dd').text()).toEqual('testValue');
        });
    });

    describe('itemDetailLink', function() {
        beforeEach(function() {
            element = '<item-detail-link label="\'testLabel\'" value="\'testValue\'"' +
                'link="\'testLink\'">' +
                '</item-detail-link>';
            element = compile(element)(scope);
            scope.$digest();
        });
        it('should contain the description elements with correct values', function() {
            expect(element.find('dt').text()).toEqual('testLabel');
            expect(element.find('dd').text()).toEqual('testValue');
            expect(element.find('a').attr('href')).toEqual('testLink');
        });
    });

    describe('itemDetailEmail', function() {
        beforeEach(function() {
            element = '<item-detail-email label="\'testLabel\'" value="\'testValue\'"' +
                'email="\'testEmail\'">' +
                '</item-detail-email>';
            element = compile(element)(scope);
            scope.$digest();
        });
        it('should contain the description elements with correct values', function() {
            expect(element.find('dt').text()).toEqual('testLabel');
            expect(element.find('dd').text()).toEqual('→ testValue');
            expect(element.find('a').attr('href')).toEqual('mailto:testEmail');
        });
    });

    describe('itemDetailAddress', function() {
        beforeEach(function() {
            scope.testAddress = {
                street_number: 555,
                street: 'street',
                city: 'city',
                state: 'state',
                zip_code: 'zip_code'
            };
            element = '<item-detail-address label="\'testLabel\'" address="testAddress">' +
                '</item-detail-address>';
            element = compile(element)(scope);
            scope.$digest();
        });
        it('should contain the description elements with correct values', function() {
            expect(element.find('dt').text()).toEqual('testLabel');
            expect(element.find('dd').text()).toEqual('555 streetcity, state zip_code');
        });
    });

    describe('itemDetailBadge', function() {
        beforeEach(function() {
            element = '<item-detail-badge label="\'testLabel\'" value="\'testValue\'">' +
                '</item-detail-badge>';
            element = compile(element)(scope);
            scope.$digest();
        });
        it('should contain the description elements with correct values', function() {
            expect(element.find('dt').text()).toEqual('testLabel');
            expect(element.find('dd').find('span').hasClass('status-testValue')).toBeTruthy();
        });
    });

    describe('userMenuLink', function() {
        var store;

        beforeEach(inject(function($localstorage) {
            store = $localstorage('session');
        }));

        it('should greet with first_name', function() {
            store.set('user', {
                first_name: 'John',
                last_name: 'Doe',
            });
            element = '<user-menu-link></user-menu-link>';
            element = compile(element)(scope);
            scope.$digest();
            expect(element.find('span')[1].textContent.trim()).toEqual('Hi, John!');
        });

        it('should greet with last_name', function() {
            store.set('user', {
                last_name: 'Doe',
            });
            element = '<user-menu-link></user-menu-link>';
            element = compile(element)(scope);
            scope.$digest();
            expect(element.find('span')[1].textContent.trim()).toEqual('Hi, Doe!');
        });

        it('should greet with "User"', function() {
            store.set('user', {
                foo: 'bar',
            });
            element = '<user-menu-link></user-menu-link>';
            element = compile(element)(scope);
            scope.$digest();
            expect(element.find('span')[1].textContent.trim()).toEqual('Hi, User!');
        });
    });

    describe('userAvatar', function() {
        var store, user;

        it('should contain the img tag in case of valid thumb', function() {
            scope.user = {
                first_name: 'John',
                last_name: 'Doe',
                image_url: 'http://placehold.it/30',
            };
            element = '<user-avatar user="user"></user-avatar>';
            element = compile(element)(scope);
            scope.$digest();
            expect(element.find('img').attr('src')).toEqual('http://placehold.it/30');
        });

        it('should contain the span tag in case of invalid thumb', function() {
            scope.user = {
                first_name: 'John',
                last_name: 'Doe',
            };
            element = '<user-avatar user="user"></user-avatar>';
            element = compile(element)(scope);
            scope.$digest();
            expect(element.find('span').text().trim()).toEqual('JD');
        });

        it(
            'should contain the span tag with adjusted data in case of missing first_name',
            function() {
                scope.user = {
                    last_name: 'Doe',
                };
                element = '<user-avatar user="user"></user-avatar>';
                element = compile(element)(scope);
                scope.$digest();
                expect(element.find('span').text().trim()).toEqual('D');
            }
        );

        it('should contain the span tag with default data in case of missing info', function() {
            scope.user = {
                foo: 'bar',
            };
            element = '<user-avatar user="user"></user-avatar>';
            element = compile(element)(scope);
            scope.$digest();
            expect(element.find('span').text().trim()).toEqual('u');
        });
    });

    describe('checkbox', function() {
        it('should contain the expected elements and classes', function() {
            element = '<checkbox></checkbox>';
            element = compile(element)(scope);
            scope.$digest();
            expect(element.find('span').hasClass('checkbox-container')).toBeTruthy();
            expect(element.find('input').length).toEqual(1);
        });
    });
});
