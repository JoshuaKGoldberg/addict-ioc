define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RegistrationContext = (function () {
        function RegistrationContext(registry, registrationSettings) {
            this.registry = registry;
            this.registrationSettings = registrationSettings;
        }
        RegistrationContext.prototype.createRegistrationTemplate = function (registrationSettings) {
            return new RegistrationContext(this, registrationSettings);
        };
        RegistrationContext.prototype.register = function (key, type) {
            var registration = this.registry.register(key, type);
            this.applyRegistrationTemplate(registration.settings, this.registrationSettings);
            return registration;
        };
        RegistrationContext.prototype.registerObject = function (key, object) {
            var registration = this.registry.registerObject(key, object);
            this.applyRegistrationTemplate(registration.settings, this.registrationSettings);
            return registration;
        };
        RegistrationContext.prototype.registerFactory = function (key, factory) {
            var registration = this.registry.registerFactory(key, factory);
            this.applyRegistrationTemplate(registration.settings, this.registrationSettings);
            return registration;
        };
        RegistrationContext.prototype.unregister = function (key) {
            return this.registry.unregister(key);
        };
        RegistrationContext.prototype.applyRegistrationTemplate = function (registrationSettings, template) {
            return Object.assign(this.registrationSettings, registrationSettings);
        };
        return RegistrationContext;
    }());
    exports.RegistrationContext = RegistrationContext;
});

//# sourceMappingURL=registration_context.js.map
