"use strict";
var RegistrationContext = (function () {
    function RegistrationContext(registry, registrationSettings) {
        this.registry = registry;
        this.registrationSettings = registrationSettings;
    }
    RegistrationContext.prototype.register = function (key, type) {
        var registration = this.registry.register(key, type);
        Object.assign(registration.settings, this.registrationSettings);
        return registration;
    };
    RegistrationContext.prototype.unregister = function (key) {
        return this.registry.unregister(key);
    };
    return RegistrationContext;
}());
exports.RegistrationContext = RegistrationContext;

//# sourceMappingURL=registration_context.js.map
