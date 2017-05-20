define(["require", "exports", "./registration", "./registration_settings", "./registration_context"], function (require, exports, registration_1, registration_settings_1, registration_context_1) {
    "use strict";
    var Registry = (function () {
        function Registry(settings, parentRegistry) {
            this.registrations = {};
            this.settings = settings;
            this.parentRegistry = parentRegistry;
        }
        Registry.prototype.clear = function () {
            this.registrations = {};
        };
        Registry.prototype.importRegistrations = function (registrationSettings) {
            var _this = this;
            registrationSettings.forEach(function (registrationSetting) {
                var registration = new registration_1.Registration(registrationSetting);
                _this.cacheRegistration(registrationSetting.key, registration);
            });
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
            var settings = registrationSettings ? new registration_settings_1.RegistrationSettings(Object.assign({}, registrationSettings)) : Object.assign({}, this.settings.defaults);
            settings.key = key;
            settings.type = type;
            var registration = new registration_1.Registration(settings);
            return registration;
        };
        Registry.prototype.createObjectRegistration = function (key, object, registrationSettings) {
            var settings = registrationSettings ? new registration_settings_1.RegistrationSettings(registrationSettings) : Object.assign({}, this.settings.defaults);
            settings.key = key;
            settings.isObject = true;
            settings.object = object;
            var registration = new registration_1.Registration(settings);
            return registration;
        };
        Registry.prototype.createFactoryRegistration = function (key, factoryFunction, registrationSettings) {
            var settings = registrationSettings ? new registration_settings_1.RegistrationSettings(registrationSettings) : Object.assign({}, this.settings.defaults);
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
            return Object.keys(this.registrations);
        };
        Registry.prototype.cacheRegistration = function (key, registration) {
            this.registrations[key] = registration;
        };
        Registry.prototype.deleteRegistration = function (key) {
            delete this.registrations[key];
        };
        Registry.prototype.getKeysByTags = function () {
            var _this = this;
            var tags = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                tags[_i] = arguments[_i];
            }
            var foundKeys = [];
            var registrationKeys = this.getRegistrationKeys();
            registrationKeys.forEach(function (registrationKey) {
                var registration = _this.getRegistration(registrationKey);
                if (_this._hasRegistrationTags(registration, tags)) {
                    foundKeys.push(registration.settings.key);
                }
            });
            return foundKeys;
        };
        Registry.prototype.getKeysByAttributes = function (attributes) {
            var _this = this;
            var foundKeys = [];
            var attributeKeys = Object.keys(attributes);
            var registrationKeys = this.getKeysByTags.apply(this, attributeKeys);
            registrationKeys.forEach(function (registrationKey) {
                var registration = _this.getRegistration(registrationKey);
                var registrationHasAttributes = _this._hasRegistrationAttributes(registration, attributes);
                if (registrationHasAttributes) {
                    foundKeys.push(registration.settings.key);
                }
            });
            return foundKeys;
        };
        Registry.prototype._hasRegistrationAttributes = function (registration, attributes) {
            var attributeKeys = Object.keys(attributes);
            var attributeMissing = attributeKeys.some(function (attribute) {
                var attributeValue = registration.settings.tags[attribute];
                if (attributeValue !== attributes[attribute]) {
                    return true;
                }
            });
            return !attributeMissing;
        };
        Registry.prototype._hasRegistrationTags = function (registration, tags) {
            var declaredTags = Object.keys(registration.settings.tags);
            var isTagMissing = tags.some(function (tag) {
                if (declaredTags.indexOf(tag) < 0) {
                    return true;
                }
            });
            return !isTagMissing;
        };
        return Registry;
    }());
    exports.Registry = Registry;
});

//# sourceMappingURL=registry.js.map