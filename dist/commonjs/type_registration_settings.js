"use strict";
var TypeRegistrationSettings = (function () {
    function TypeRegistrationSettings(defaults, key, type, isFactory, isObject) {
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
    Object.defineProperty(TypeRegistrationSettings.prototype, "defaults", {
        get: function () {
            return this._defaults;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "key", {
        get: function () {
            return this._key;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "dependencies", {
        get: function () {
            return this._dependencies;
        },
        set: function (value) {
            this._dependencies = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "config", {
        get: function () {
            return this._config;
        },
        set: function (value) {
            this._config = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "tags", {
        get: function () {
            return this._tags;
        },
        set: function (value) {
            this._tags = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "injectInto", {
        get: function () {
            return this._injectInto;
        },
        set: function (value) {
            this._injectInto = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "functionsToBind", {
        get: function () {
            return this._functionsToBind;
        },
        set: function (value) {
            this._functionsToBind = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "lazyKeys", {
        get: function () {
            return this._lazyKeys;
        },
        set: function (value) {
            this._lazyKeys = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "overwrittenKeys", {
        get: function () {
            return this._overwrittenKeys;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "isFactory", {
        get: function () {
            return this.getSettingOrDefault('isFactory');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "subscriptions", {
        get: function () {
            return this._subscriptions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "isSingleton", {
        get: function () {
            return this.getSettingOrDefault('isSingleton');
        },
        set: function (value) {
            this._isSingleton = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "wantsInjection", {
        get: function () {
            return this.getSettingOrDefault('wantsInjection');
        },
        set: function (value) {
            this._wantsInjection = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "isLazy", {
        get: function () {
            return this.getSettingOrDefault('isLazy');
        },
        set: function (value) {
            this._isLazy = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "bindFunctions", {
        get: function () {
            return this.getSettingOrDefault('bindFunctions');
        },
        set: function (value) {
            this._bindFunctions = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "autoCreateMissingSubscribers", {
        get: function () {
            return this.getSettingOrDefault('autoCreateMissingSubscribers');
        },
        set: function (value) {
            this._autoCreateMissingSubscribers = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeRegistrationSettings.prototype, "isObject", {
        get: function () {
            return this._isObject;
        },
        set: function (value) {
            this._isObject = value;
        },
        enumerable: true,
        configurable: true
    });
    TypeRegistrationSettings.prototype.getSettingOrDefault = function (key) {
        return typeof this["_" + key] !== 'undefined' ? this["_" + key] : this.defaults[key];
    };
    return TypeRegistrationSettings;
}());
exports.TypeRegistrationSettings = TypeRegistrationSettings;

//# sourceMappingURL=type_registration_settings.js.map
