define(["require", "exports", "./default_settings", "./registration", "./registration_context", "./registration_settings"], function (require, exports, default_settings_1, registration_1, registration_context_1, registration_settings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Registry = (function () {
        function Registry(settings, parentRegistry) {
            this.parentRegistry = parentRegistry;
            this.registrations = {};
            this.settings = settings;
            this.parentRegistry = parentRegistry;
        }
        Registry.prototype.initialize = function () {
            this.settings = this._mergeSettings(default_settings_1.defaultSettings, this.settings);
        };
        Registry.prototype.clear = function () {
            this.registrations = {};
        };
        Registry.prototype._mergeSettings = function (existingSettings, newSettings) {
            if (!existingSettings) {
                return newSettings;
            }
            if (!newSettings) {
                return existingSettings;
            }
            var settings = Object.assign({}, existingSettings);
            Object.assign(settings, newSettings);
            Object.assign(settings.defaults, existingSettings.defaults);
            Object.assign(settings.defaults, newSettings.defaults);
            return settings;
        };
        Registry.prototype.importRegistrations = function (registrationSettings) {
            for (var _i = 0, registrationSettings_1 = registrationSettings; _i < registrationSettings_1.length; _i++) {
                var registrationSetting = registrationSettings_1[_i];
                var registration = new registration_1.Registration(registrationSetting);
                this.cacheRegistration(registrationSetting.key, registration);
            }
        };
        Registry.prototype.exportRegistrations = function (keysToExport) {
            var _this = this;
            var registrationKeys = keysToExport || this.getRegistrationKeys();
            return registrationKeys.map(function (registrationKey) {
                var registration = _this.getRegistration(registrationKey);
                var exportedSettings = Object.assign({}, registration.settings);
                delete exportedSettings.type;
                delete exportedSettings.object;
                delete exportedSettings.factory;
                delete exportedSettings.resolver;
                return exportedSettings;
            });
        };
        Registry.prototype.isRegistered = function (key) {
            var registration = this.getRegistration(key);
            return !!registration;
        };
        Registry.prototype.createRegistrationTemplate = function (registrationSettings) {
            return new registration_context_1.RegistrationContext(this, registrationSettings);
        };
        Registry.prototype.register = function (key, type, settings) {
            var registration = this.createRegistration(key, type, settings);
            this.cacheRegistration(key, registration);
            return registration;
        };
        Registry.prototype.registerObject = function (key, object, settings) {
            var registration = this.createObjectRegistration(key, object, settings);
            this.cacheRegistration(key, registration);
            return registration;
        };
        Registry.prototype.registerFactory = function (key, factoryMethod, settings) {
            var registration = this.createFactoryRegistration(key, factoryMethod, settings);
            this.cacheRegistration(key, registration);
            return registration;
        };
        Registry.prototype.unregister = function (key) {
            var registration = this.getRegistration(key);
            this.deleteRegistration(key);
            return registration;
        };
        Registry.prototype.createRegistration = function (key, type, registrationSettings) {
            var settings = registrationSettings ? new registration_settings_1.TypeRegistrationSettings(Object.assign({}, registrationSettings)) : Object.assign({}, this.settings.defaults);
            settings.key = key;
            settings.type = type;
            var registration = new registration_1.Registration(settings);
            return registration;
        };
        Registry.prototype.createObjectRegistration = function (key, object, registrationSettings) {
            var settings = registrationSettings ? new registration_settings_1.ObjectRegistrationSettings(registrationSettings) : Object.assign({}, this.settings.defaults);
            settings.key = key;
            settings.isObject = true;
            settings.object = object;
            var registration = new registration_1.Registration(settings);
            return registration;
        };
        Registry.prototype.createFactoryRegistration = function (key, factoryFunction, registrationSettings) {
            var settings = registrationSettings ? new registration_settings_1.FactoryRegistrationSettings(registrationSettings) : Object.assign({}, this.settings.defaults);
            settings.key = key;
            settings.isFactory = true;
            settings.factory = factoryFunction;
            var registration = new registration_1.Registration(settings);
            return registration;
        };
        Registry.prototype.getRegistration = function (key) {
            var registration = this.registrations[key];
            if (!registration && this.parentRegistry) {
                return this.parentRegistry.getRegistration(key);
            }
            return registration;
        };
        Registry.prototype.getRegistrationKeys = function () {
            var keys = Object.keys(this.registrations);
            return keys.sort(function (a, b) {
                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }
                return 0;
            });
        };
        Registry.prototype.cacheRegistration = function (key, registration) {
            this.registrations[key] = registration;
        };
        Registry.prototype.deleteRegistration = function (key) {
            delete this.registrations[key];
        };
        Registry.prototype.getKeysByTags = function () {
            var tags = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                tags[_i] = arguments[_i];
            }
            var registrationKeys = this.getRegistrationKeys();
            var foundKeys = [];
            var query = this._buildTagQuery.apply(this, tags);
            for (var tag in query) {
                var tagValue = query[tag];
                for (var _a = 0, registrationKeys_1 = registrationKeys; _a < registrationKeys_1.length; _a++) {
                    var registrationKey = registrationKeys_1[_a];
                    var registration = this.getRegistration(registrationKey);
                    if (Object.keys(tagValue).length > 0) {
                        if (tagValue === registration.settings.tags[tag]) {
                            foundKeys.push(registrationKey);
                        }
                    }
                    else if (!!registration.settings.tags[tag]) {
                        foundKeys.push(registrationKey);
                    }
                }
            }
            return foundKeys;
        };
        Registry.prototype._buildTagQuery = function () {
            var tags = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                tags[_i] = arguments[_i];
            }
            var query = {};
            for (var _a = 0, tags_1 = tags; _a < tags_1.length; _a++) {
                var value = tags_1[_a];
                if (typeof value === 'string') {
                    var hasTagDefaultValue = typeof query[value] !== 'undefined';
                    if (!hasTagDefaultValue) {
                        query[value] = {};
                    }
                }
                else {
                    for (var tagKey in value) {
                        var tagValue = query[tagKey];
                        var hasTagValue = !!tagValue && Object.keys(tagValue).length !== 0;
                        if (!hasTagValue) {
                            query[tagKey] = value[tagKey];
                        }
                    }
                }
            }
            return query;
        };
        return Registry;
    }());
    exports.Registry = Registry;
});

//# sourceMappingURL=registry.js.map
