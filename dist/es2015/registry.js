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
    Registry.prototype.autoRegisterModules = function () {
    };
    Registry.prototype.isRegistered = function (key) {
        var registration = this.getRegistration(key);
        return !!registration;
    };
    Registry.prototype.createRegistrationTemplate = function (registrationSettings) {
        return new RegistrationContext(this, registrationSettings);
    };
    Registry.prototype.register = function (key, type) {
        var registration = this.createTypeRegistration(key, type);
        this.cacheRegistration(key, registration);
        return registration;
    };
    Registry.prototype.registerObject = function (key, object) {
        var registrationSettings = Object.assign({}, this.settings.defaults);
        registrationSettings.isObject = true;
        var registration = this.createObjectRegistration(key, object, registrationSettings);
        this.cacheRegistration(key, registration);
        return registration;
    };
    Registry.prototype.registerFactory = function (key, factoryMethod) {
        var registrationSettings = Object.assign({}, this.settings.defaults);
        registrationSettings.isFactory = true;
        var registration = this.createFactoryRegistration(key, factoryMethod, registrationSettings);
        this.cacheRegistration(key, registration);
        return registration;
    };
    Registry.prototype.unregister = function (key) {
        var registration = this.getRegistration(key);
        this.deleteRegistration(key);
        return registration;
    };
    Registry.prototype.createTypeRegistration = function (key, type, registrationSettings) {
        var settings = registrationSettings ? new TypeRegistrationSettings(registrationSettings) : Object.assign({}, this.settings.defaults);
        settings.key = key;
        settings.type = type;
        var registration = new TypeRegistration(settings);
        return registration;
    };
    Registry.prototype.createObjectRegistration = function (key, object, registrationSettings) {
        var settings = registrationSettings ? new TypeRegistrationSettings(registrationSettings) : Object.assign({}, this.settings.defaults);
        settings.key = key;
        settings.object = object;
        var registration = new TypeRegistration(settings);
        return registration;
    };
    Registry.prototype.createFactoryRegistration = function (key, factoryFunction, registrationSettings) {
        var settings = registrationSettings ? new TypeRegistrationSettings(registrationSettings) : Object.assign({}, this.settings.defaults);
        settings.key = key;
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
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var foundKeys = [];
        var registrationKeys = this.getRegistrationKeys();
        registrationKeys.forEach(function (registrationKey) {
            var registration = _this.getRegistration(registrationKey);
            if (registration.hasTags(args)) {
                foundKeys.push(registration.settings.key);
            }
        });
        return foundKeys;
    };
    return Registry;
}());
export { Registry };

//# sourceMappingURL=registry.js.map
