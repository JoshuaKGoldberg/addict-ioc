"use strict";
const registration_1 = require("./registration");
const registration_settings_1 = require("./registration_settings");
const registration_context_1 = require("./registration_context");
const default_settings_1 = require("./default_settings");
class Registry {
    constructor(settings, parentRegistry) {
        this.parentRegistry = parentRegistry;
        this.registrations = {};
        this.settings = settings;
        this.parentRegistry = parentRegistry;
    }
    initialize() {
        this.settings = this._mergeSettings(default_settings_1.DefaultSettings, this.settings);
    }
    clear() {
        this.registrations = {};
    }
    _mergeSettings(existingSettings, newSettings) {
        if (!existingSettings) {
            return newSettings;
        }
        if (!newSettings) {
            return existingSettings;
        }
        const settings = Object.assign({}, existingSettings);
        Object.assign(settings, newSettings);
        Object.assign(settings.defaults, existingSettings.defaults);
        Object.assign(settings.defaults, newSettings.defaults);
        return settings;
    }
    importRegistrations(registrationSettings) {
        for (const registrationSetting of registrationSettings) {
            const registration = new registration_1.Registration(registrationSetting);
            this.cacheRegistration(registrationSetting.key, registration);
        }
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
        const registrationKeys = this.getRegistrationKeys();
        const foundKeys = [];
        const query = this._buildTagQuery(tags);
        for (const tag in query) {
            const tagValue = query[tag];
            for (const registrationKey of registrationKeys) {
                const registration = this.getRegistration(registrationKey);
                const registrationTagValue = registration.settings.tags[tag];
                if (tagValue == registrationTagValue) {
                    foundKeys.push(registrationKey);
                }
            }
        }
        return foundKeys;
    }
    _buildTagQuery(...tags) {
        const query = {};
        for (const value of tags) {
            if (typeof value === 'string') {
                const hasTagDefaultValue = typeof query[value] === 'undefined';
                if (!hasTagDefaultValue) {
                    query[value] = {};
                }
            }
            else {
                for (const tagKey in value) {
                    const tagValue = query[tagKey];
                    const hasTagValue = Object.keys(tagValue).length !== 0;
                    if (!hasTagValue) {
                        query[tagKey] = value[tagKey];
                    }
                }
            }
        }
        return query;
    }
}
exports.Registry = Registry;

//# sourceMappingURL=registry.js.map
