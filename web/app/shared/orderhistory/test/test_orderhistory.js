'use strict';

describe('hq.orderhistory', function() {
    var compile, element, scope;

    beforeEach(commonSetup);
    beforeEach(inject(function($rootScope, $compile) {
        compile = $compile;
        scope = $rootScope.$new();
    }));

    describe('orderHistory', function() {
        it('should contain a table with events sorted by timestamp desc', function() {
            scope.events = [{
                timestamp: '2015-12-21T15:35:12.686765',
                event_name: 'pending',
                event_data: {
                    channel: 'Mobile App'
                }
            }, {
                timestamp: '2015-12-21T15:35:12.686765',
                event_name: 'pending',
                event_data: {
                    channel: 'Mobile App'
                }
            }, {
                timestamp: '2015-12-21T15:35:13.112552',
                event_name: 'picking',
                event_data: {
                    store_associate_name: 'John Doe',
                    store_associate_id: '67890',
                    store_id: 'NY-02'
                }
            }, {
                timestamp: '2015-12-21T15:35:12.787394',
                event_name: 'declined',
                event_data: {
                    store_associate_name: 'Jenny Smith',
                    store_associate_id: '12345',
                    store_id: 'NY-01'
                }
            }];
            element = '<order-history events="events"></order-history>';
            element = compile(element)(scope);
            scope.$digest();

            expect(element.attr('id')).toEqual('order-history');
            expect(element.find('tr').length).toEqual(8);
            expect(element.find('td')[8].textContent.trim()).toEqual('12/21/15 3:35 PM');
            expect(element.find('td')[9].textContent.trim()).toEqual('Pending');
            expect(element.find('td')[11].textContent.trim()).toEqual(
                'Order was created by customer via Mobile App'
            );
        });

        it('should contain an empty table when invalid array is provided', function() {
            scope.events = null;
            element = '<order-history events="events"></order-history>';
            element = compile(element)(scope);
            scope.$digest();

            expect(element.attr('id')).toEqual('order-history');
            expect(element.find('tr').length).toEqual(0);
        });

        it('should contain an empty table when empty array is provided', function() {
            scope.events = [];
            element = '<order-history events="events"></order-history>';
            element = compile(element)(scope);
            scope.$digest();

            expect(element.attr('id')).toEqual('order-history');
            expect(element.find('tr').length).toEqual(0);
        });
    });
});
