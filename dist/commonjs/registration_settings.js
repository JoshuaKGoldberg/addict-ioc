"use strict";
class RegistrationSettings {
    constructor(registrationSettings) {
        this.settings = {};
        Object.assign(this.settings, registrationSettings);
    }
    get key() {
        return this.settings.key;
    }
    set key(value) {
        this.settings.key = value;
    }
    get object() {
        return this.settings.object;
    }
    set object(value) {
        this.settings.object = value;
    }
    get factory() {
        return this.settings.factory;
    }
    set factory(value) {
        this.settings.factory = value;
    }
    get resolver() {
        return this._getCurrentOrDefault('resolver');
    }
    get module() {
        return this._getCurrentOrDefault('module');
    }
    get config() {
        return this._getCurrentOrDefault('config');
    }
    get dependencies() {
        return this._getCurrentOrDefaultArray('dependencies');
    }
    get ownedDependencies() {
        return this._getCurrentOrDefaultArray('ownedDependencies');
    }
    get lazyDependencies() {
        return this._getCurrentOrDefaultArray('lazyDependencies');
    }
    get lazyDependenciesAsync() {
        return this._getCurrentOrDefaultArray('lazyDependenciesAsync');
    }
    get isSingleton() {
        return this._getCurrentOrDefault('isSingleton');
    }
    get isObject() {
        return this._getCurrentOrDefault('isObject');
    }
    get isFactory() {
        return this._getCurrentOrDefault('isFactory');
    }
    get wantsInjection() {
        return this._getCurrentOrDefault('wantsInjection');
    }
    get injectInto() {
        return this._getCurrentOrDefault('injectInto');
    }
    get functionsToBind() {
        return this._getCurrentOrDefaultArray('functionsToBind');
    }
    get overwrittenKeys() {
        return this._getCurrentOrDefaultIndexer('overwrittenKeys');
    }
    _getCurrentOrDefault(key) {
        return typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
    }
    _getCurrentOrDefaultArray(key) {
        const defaultValue = typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
        return defaultValue || [];
    }
    _getCurrentOrDefaultIndexer(key) {
        const defaultValue = typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
        if (!defaultValue) {
            const value = {};
            this.settings[key] = value;
            return value;
        }
        return defaultValue;
    }
}
exports.RegistrationSettings = RegistrationSettings;
class TypeRegistrationSettings extends RegistrationSettings {
    constructor(registrationSettings) {
        super(registrationSettings);
    }
    get settings() {
        return this.settings;
    }
    get type() {
        return this.settings.type;
    }
    set type(value) {
        this.settings.type = value;
    }
}
exports.TypeRegistrationSettings = TypeRegistrationSettings;
class ObjectRegistrationSettings extends RegistrationSettings {
    constructor(registrationSettings) {
        super(registrationSettings);
    }
    get settings() {
        return this.settings;
    }
    get object() {
        return this.settings.object;
    }
    set object(value) {
        this.settings.object = value;
    }
}
exports.ObjectRegistrationSettings = ObjectRegistrationSettings;
class FactoryRegistrationSettings extends RegistrationSettings {
    constructor(registrationSettings) {
        super(registrationSettings);
    }
    get settings() {
        return this.settings;
    }
    get object() {
        return this.settings.object;
    }
    set object(value) {
        this.settings.object = value;
    }
}
exports.FactoryRegistrationSettings = FactoryRegistrationSettings;

//# sourceMappingURL=registration_settings.js.map
