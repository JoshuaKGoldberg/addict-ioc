import { TypeRegistration } from './type_registration';
import { TypeRegistrationSettings } from './type_registration_settings';
import { RegistrationContext } from './registration_context';
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
            var registration = new TypeRegistration(registrationSetting);
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
            delete exportedSettings.resolver;
            return exportedSettings;
        });
    };
    Registry.prototype.isRegistered = function (key) {
        var registration = this.getRegistration(key);
        return !!registration;
    };
    Registry.prototype.createRegistrationTemplate = function (registrationSettings) {
        return new RegistrationContext(this, registrationSettings);
    };
    Registry.prototype.register = function (key, type, settings) {
        var registration = this.createTypeRegistration(key, type, settings);
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
    Registry.prototype.createTypeRegistration = function (key, type, registrationSettings) {
        var settings = registrationSettings ? new TypeRegistrationSettings(Object.assign({}, registrationSettings)) : Object.assign({}, this.settings.defaults);
        settings.key = key;
        settings.type = type;
        var registration = new TypeRegistration(settings);
        return registration;
    };
    Registry.prototype.createObjectRegistration = function (key, object, registrationSettings) {
        var settings = registrationSettings ? new TypeRegistrationSettings(registrationSettings) : Object.assign({}, this.settings.defaults);
        settings.key = key;
        settings.isObject = true;
        settings.object = object;
        var registration = new TypeRegistration(settings);
        return registration;
    };
    Registry.prototype.createFactoryRegistration = function (key, factoryFunction, registrationSettings) {
        var settings = registrationSettings ? new TypeRegistrationSettings(registrationSettings) : Object.assign({}, this.settings.defaults);
        settings.key = key;
        settings.isFactory = true;
        settings.factory = factoryFunction;
        var registration = new TypeRegistration(settings);
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
export { Registry };

//# sourceMappingURL=registry.js.map
