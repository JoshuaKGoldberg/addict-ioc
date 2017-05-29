"use strict";
const registration_1 = require("./registration");
const registration_settings_1 = require("./registration_settings");
const registration_context_1 = require("./registration_context");
class Registry {
    constructor(settings, parentRegistry) {
        this.registrations = {};
        this.settings = settings;
        this.parentRegistry = parentRegistry;
    }
    clear() {
        this.registrations = {};
    }
    importRegistrations(registrationSettings) {
        registrationSettings.forEach((registrationSetting) => {
            const registration = new registration_1.Registration(registrationSetting);
            this.cacheRegistration(registrationSetting.key, registration);
        });
    }
    exportRegistrations(keysToExport) {
        const registrationKeys = keysToExport || this.getRegistrationKeys();
        return registrationKeys.map((registrationKey) => {
            const registration = this.getRegistration(registrationKey);
            const exportedSettings = Object.assign({}, registration.settings);
            delete exportedSettings.type;
            delete exportedSettings.object;
            delete exportedSettings.factory;
            delete exportedSettings.resolver;
            return exportedSettings;
        });
    }
    isRegistered(key) {
        const registration = this.getRegistration(key);
        return !!registration;
    }
    createRegistrationTemplate(registrationSettings) {
        return new registration_context_1.RegistrationContext(this, registrationSettings);
    }
    register(key, type, settings) {
        const registration = this.createRegistration(key, type, settings);
        this.cacheRegistration(key, registration);
        return registration;
    }
    registerObject(key, object, settings) {
        const registration = this.createObjectRegistration(key, object, settings);
        this.cacheRegistration(key, registration);
        return registration;
    }
    registerFactory(key, factoryMethod, settings) {
        const registration = this.createFactoryRegistration(key, factoryMethod, settings);
        this.cacheRegistration(key, registration);
        return registration;
    }
    unregister(key) {
        const registration = this.getRegistration(key);
        this.deleteRegistration(key);
        return registration;
    }
    createRegistration(key, type, registrationSettings) {
        const settings = registrationSettings ? new registration_settings_1.TypeRegistrationSettings(Object.assign({}, registrationSettings)) : Object.assign({}, this.settings.defaults);
        settings.key = key;
        settings.type = type;
        const registration = new registration_1.Registration(settings);
        return registration;
    }
    createObjectRegistration(key, object, registrationSettings) {
        const settings = registrationSettings ? new registration_settings_1.ObjectRegistrationSettings(registrationSettings) : Object.assign({}, this.settings.defaults);
        settings.key = key;
        settings.isObject = true;
        settings.object = object;
        const registration = new registration_1.Registration(settings);
        return registration;
    }
    createFactoryRegistration(key, factoryFunction, registrationSettings) {
        const settings = registrationSettings ? new registration_settings_1.FactoryRegistrationSettings(registrationSettings) : Object.assign({}, this.settings.defaults);
        settings.key = key;
        settings.isFactory = true;
        settings.factory = factoryFunction;
        const registration = new registration_1.Registration(settings);
        return registration;
    }
    getRegistration(key) {
        const registration = this.registrations[key];
        if (!registration && this.parentRegistry) {
            return this.parentRegistry.getRegistration(key);
        }
        return registration;
    }
    getRegistrationKeys() {
        return Object.keys(this.registrations);
    }
    cacheRegistration(key, registration) {
        this.registrations[key] = registration;
    }
    deleteRegistration(key) {
        delete this.registrations[key];
    }
    getKeysByTags(...tags) {
        const foundKeys = [];
        const registrationKeys = this.getRegistrationKeys();
        registrationKeys.forEach((registrationKey) => {
            const registration = this.getRegistration(registrationKey);
            if (this._hasRegistrationTags(registration, tags)) {
                foundKeys.push(registration.settings.key);
            }
        });
        return foundKeys;
    }
    getKeysByAttributes(attributes) {
        const foundKeys = [];
        const attributeKeys = Object.keys(attributes);
        const registrationKeys = this.getKeysByTags(...attributeKeys);
        registrationKeys.forEach((registrationKey) => {
            const registration = this.getRegistration(registrationKey);
            const registrationHasAttributes = this._hasRegistrationAttributes(registration, attributes);
            if (registrationHasAttributes) {
                foundKeys.push(registration.settings.key);
            }
        });
        return foundKeys;
    }
    _hasRegistrationAttributes(registration, attributes) {
        const attributeKeys = Object.keys(attributes);
        const attributeMissing = attributeKeys.some((attribute) => {
            const attributeValue = registration.settings.tags[attribute];
            if (attributeValue !== attributes[attribute]) {
                return true;
            }
        });
        return !attributeMissing;
    }
    _hasRegistrationTags(registration, tags) {
        const declaredTags = Object.keys(registration.settings.tags);
        const isTagMissing = tags.some((tag) => {
            if (declaredTags.indexOf(tag) < 0) {
                return true;
            }
        });
        return !isTagMissing;
    }
}
exports.Registry = Registry;

//# sourceMappingURL=registry.js.map
