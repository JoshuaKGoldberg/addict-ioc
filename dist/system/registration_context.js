System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var RegistrationContext;
    return {
        setters: [],
        execute: function () {
            RegistrationContext = (function () {
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
            exports_1("RegistrationContext", RegistrationContext);
        }
    };
});

//# sourceMappingURL=registration_context.js.map
