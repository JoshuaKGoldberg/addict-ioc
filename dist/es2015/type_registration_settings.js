export class TypeRegistrationSettings {
    constructor(defaults, key, type, isFactory, isObject) {
        this._defaults = undefined;
        this._key = undefined;
        this._type = undefined;
        this._dependencies = [];
        this._config = undefined;
        this._tags = {};
        this._injectInto = undefined;
        this._functionsToBind = [];
        this._lazyKeys = [];
        this._overwrittenKeys = {};
        this._isSingleton = undefined;
        this._wantsInjection = undefined;
        this._isLazy = undefined;
        this._bindFunctions = undefined;
        this._subscriptions = undefined;
        this._isFactory = undefined;
        this._isObject = undefined;
        this._autoCreateMissingSubscribers = undefined;
        this._subscriptions = {
            newInstance: []
        };
        this._defaults = defaults;
        this._key = key;
        this._type = type;
        this._isFactory = isFactory || false;
        this._isObject = isObject || false;
    }
    get defaults() {
        return this._defaults;
    }
    get key() {
        return this._key;
    }
    get type() {
        return this._type;
    }
    get dependencies() {
        return this._dependencies;
    }
    set dependencies(value) {
        this._dependencies = value;
    }
    get config() {
        return this._config;
    }
    set config(value) {
        this._config = value;
    }
    get tags() {
        return this._tags;
    }
    set tags(value) {
        this._tags = value;
    }
    get injectInto() {
        return this._injectInto;
    }
    set injectInto(value) {
        this._injectInto = value;
    }
    get functionsToBind() {
        return this._functionsToBind;
    }
    set functionsToBind(value) {
        this._functionsToBind = value;
    }
    get lazyKeys() {
        return this._lazyKeys;
    }
    set lazyKeys(value) {
        this._lazyKeys = value;
    }
    get overwrittenKeys() {
        return this._overwrittenKeys;
    }
    get isFactory() {
        return this.getSettingOrDefault('isFactory');
    }
    get subscriptions() {
        return this._subscriptions;
    }
    get isSingleton() {
        return this.getSettingOrDefault('isSingleton');
    }
    set isSingleton(value) {
        this._isSingleton = value;
    }
    get wantsInjection() {
        return this.getSettingOrDefault('wantsInjection');
    }
    set wantsInjection(value) {
        this._wantsInjection = value;
    }
    get isLazy() {
        return this.getSettingOrDefault('isLazy');
    }
    set isLazy(value) {
        this._isLazy = value;
    }
    get bindFunctions() {
        return this.getSettingOrDefault('bindFunctions');
    }
    set bindFunctions(value) {
        this._bindFunctions = value;
    }
    get autoCreateMissingSubscribers() {
        return this.getSettingOrDefault('autoCreateMissingSubscribers');
    }
    set autoCreateMissingSubscribers(value) {
        this._autoCreateMissingSubscribers = value;
    }
    get isObject() {
        return this._isObject;
    }
    set isObject(value) {
        this._isObject = value;
    }
    getSettingOrDefault(key) {
        return typeof this[`_${key}`] !== 'undefined' ? this[`_${key}`] : this.defaults[key];
    }
}

//# sourceMappingURL=type_registration_settings.js.map
