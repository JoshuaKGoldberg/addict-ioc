define(["require", "exports", "./type_registration", "./registration_context"], function (require, exports, type_registration_1, registration_context_1) {
    "use strict";
    var Registry = (function () {
        function Registry(settings) {
            this.registrations = {};
            this.settings = settings;
        }
        Registry.prototype.clear = function () {
            this.registrations = {};
        };
        Registry.prototype.importRegistrations = function (registrationSettings) {
            var _this = this;
            registrationSettings.forEach(function (registrationSetting) {
                var registration = new type_registration_1.TypeRegistration(registrationSetting);
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
        Registry.prototype.registerModule = function (moduleName) {
            var moduleManifest = require(moduleName + "/package.json");
            var iocModulePath = moduleManifest['ioc_module'];
            var iocModule = require(moduleName + "/" + iocModulePath);
            var registrationSettings = {
                module: moduleName
            };
            return new registration_context_1.RegistrationContext(this, registrationSettings);
        };
        Registry.prototype.register = function (key, type) {
            var registration = this.createRegistration(key, type);
            this.cacheRegistration(key, registration);
            return registration;
        };
        Registry.prototype.registerObject = function (key, object) {
            var registrationSettings = Object.assign({}, this.settings.defaults);
            Object.assign(registrationSettings, {
                isObject: true
            });
            var registration = this.createRegistration(key, object, registrationSettings);
            this.cacheRegistration(key, registration);
            return registration;
        };
        Registry.prototype.unregister = function (key) {
            var registration = this.getRegistration(key);
            this.deleteRegistration(key);
            return registration;
        };
        Registry.prototype.createRegistration = function (key, type, registrationSettings) {
            var settings = registrationSettings || Object.assign({}, this.settings.defaults);
            settings.key = key;
            settings.type = type;
            var registration = new type_registration_1.TypeRegistration(settings);
            return registration;
        };
        Registry.prototype.getRegistration = function (key) {
            return this.registrations[key];
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
        return Registry;
    }());
    exports.Registry = Registry;
});

//# sourceMappingURL=registry.js.map
