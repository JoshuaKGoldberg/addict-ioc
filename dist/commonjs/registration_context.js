"use strict";
class RegistrationContext {
    constructor(registry, registrationSettings) {
        this.registry = registry;
        this.registrationSettings = registrationSettings;
    }
    createRegistrationTemplate(registrationSettings) {
        return new RegistrationContext(this, registrationSettings);
    }
    register(key, type) {
        const registration = this.registry.register(key, type);
        this.applyRegistrationTemplate(registration.settings, this.registrationSettings);
        return registration;
    }
    registerObject(key, object) {
        const registration = this.registry.registerObject(key, object);
        this.applyRegistrationTemplate(registration.settings, this.registrationSettings);
        return registration;
    }
    unregister(key) {
        return this.registry.unregister(key);
    }
    applyRegistrationTemplate(registrationSettings, template) {
        return Object.assign(this.registrationSettings, registrationSettings);
    }
}
exports.RegistrationContext = RegistrationContext;

//# sourceMappingURL=registration_context.js.map
