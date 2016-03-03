'use strict';

describe('hq.smartdialog', function() {
    beforeEach(commonSetup);

    describe('SmartDialog', function() {
        var modal, Flash, SmartDialog;
        var defaultOptions = {
            backdrop: 'static',
            keyboard: false,
            windowClass: 'modal-no-nav custom-reveal-modal'
        };

        beforeEach(inject(function($modal, _Flash_, _SmartDialog_) {
            modal = $modal;
            Flash = _Flash_;
            SmartDialog = _SmartDialog_;
            spyOn(modal, 'open');
            spyOn(Flash, 'dismiss');
            spyOn(SmartDialog, '_open');
        }));

        describe('openModalNav', function() {
            it('should call the _open method', function() {
                SmartDialog.openModalNav({}, function() {
                    defaultOptions.windowClass = 'custom-reveal-modal';
                    expect(modal.open).toHaveBeenCalledWith(defaultOptions);
                });
            });
        });

        describe('openModal', function() {
            it('should call the _open method', function() {
                SmartDialog.openModal({}, function() {
                    expect(modal.open).toHaveBeenCalledWith(defaultOptions);
                });
            });
        });

        describe('openConfirm', function() {
            it('should call the _open method', function() {
                SmartDialog.openConfirm({}, function() {
                    defaultOptions.windowClass = 'modal-confirm custom-reveal-modal';
                    expect(modal.open).toHaveBeenCalledWith(defaultOptions);
                });
            });
        });

        describe('openList', function() {
            it('should call the _open method', function() {
                SmartDialog.openList({}, function() {
                    defaultOptions.windowClass = 'modal-list custom-reveal-modal';
                    expect(modal.open).toHaveBeenCalledWith(defaultOptions);
                });
            });
        });

        it('should call the Flash dismiss function', function() {
            SmartDialog._open({}, function() {
                expect(Flash.dismiss).toHaveBeenCalled();
            });
        });
    });
});
