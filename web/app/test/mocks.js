angular.module('uiGmapgoogle-maps', [])
    .provider('uiGmapGoogleMapApi', function() {
        var maps = {
            LatLng: function(lat, lng) {
                return {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng),

                    lat: function() {
                        return this.latitude;
                    },
                    lng: function() {
                        return this.longitude;
                    }
                };
            },
            Marker: function() {
                return {
                    setMap: function() {},
                    setPosition: function() {},
                    setVisible: function() {},
                    setDraggable: function() {},
                };
            },
            Map: function() {
                return {
                    panTo: function() {},
                    setCenter: function() {},
                    setZoom: function() {},
                    setOptions: function() {},
                };
            },
            event: {
                listeners: {},
                addListener: function(obj, eventName, callback) {
                    this.listeners[obj] = {};
                    this.listeners[obj][eventName] = callback;

                },
                fire: function(obj, eventName) {
                    this.listeners[obj][eventName]();
                },
            },
            Geocoder: function() {
                var results = {
                    '123 Test street Berlin 92492 DE': {
                        coords: [10, 20],
                        types: ['street_address'],
                    },
                    '745 Atlantic Ave, Boston, MA 02111, US': {
                        coords: [42.350294, -71.057129],
                        types: ['street_address'],
                    },
                    '123 Other street Boston 02111 MS': {
                        coords: [50, 60],
                        types: ['street_address'],
                    },
                    '746 Ninth Ave, New York, NY 10019, US': {
                        coords: [70, 80],
                        types: ['street_address'],
                    },
                    '999 Imprecise street Boston 02111 MS': {
                        coords: [50, 60],
                        types: ['street_address'],
                        partial_match: true,
                    }
                };
                return {
                    geocode: function(query, callback) {
                        if (results[query.address]) {
                            callback([{
                                geometry: {
                                    location: {
                                        lat: function() {
                                            return results[query.address]['coords'][0];
                                        },
                                        lng: function() {
                                            return results[query.address]['coords'][1];
                                        }
                                    }
                                },
                                formatted_address: 'My place name',
                                types: results[query.address]['types'],
                                partial_match: results[query.address]['partial_match'],
                            }]);
                        } else {
                            callback([]);
                        }
                    }
                };
            },
            places: {
                Autocomplete: function() {
                    return {
                        places: {
                            'valid address': {
                                address_components: [{
                                    'long_name': '746',
                                    'short_name': '746',
                                    'types': ['street_number']
                                }, {
                                    'long_name': 'Ninth Avenue',
                                    'short_name': 'Ninth Ave',
                                    'types': ['route']
                                }, {
                                    'long_name': 'Hells Kitchen',
                                    'short_name': 'Hells Kitchen',
                                    'types': ['neighborhood', 'political']
                                }, {
                                    'long_name': 'Manhattan',
                                    'short_name': 'Manhattan',
                                    'types': ['sublocality_level_1', 'sublocality', 'political']
                                }, {
                                    'long_name': 'New York',
                                    'short_name': 'NY',
                                    'types': ['locality', 'political']
                                }, {
                                    'long_name': 'New York County',
                                    'short_name': 'New York County',
                                    'types': ['administrative_area_level_2', 'political']
                                }, {
                                    'long_name': 'New York',
                                    'short_name': 'NY',
                                    'types': ['administrative_area_level_1', 'political']
                                }, {
                                    'long_name': 'United States',
                                    'short_name': 'US',
                                    'types': ['country', 'political']
                                }, {
                                    'long_name': '10019',
                                    'short_name': '10019',
                                    'types': ['postal_code']
                                }],
                                types: ['street_address'],
                                geometry: {
                                    location: {
                                        lat: function() {
                                            return 100;
                                        },
                                        lng: function() {
                                            return 200;
                                        },
                                    }
                                }
                            },
                            'invalid address': {
                                types: ['locality'],
                            },
                            'some string': {
                                name: 'some string',
                            },
                        },
                        val: null,
                        bindTo: function() {},
                        enter: function(str) {
                            this.val = str;
                        },
                        getPlace: function() {
                            return this.places[this.val];
                        },
                    };
                },
            },
        };

        this.$get = function() {
            return {
                then: function(callback) {
                    callback(maps);
                }
            };
        };
        this.configure = function(config) {};
    });
