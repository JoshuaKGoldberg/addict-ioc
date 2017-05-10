define(["require", "exports"], function (require, exports) {
    "use strict";
    var TypeRegistrationSettings = (function () {
        function TypeRegistrationSettings(registrationSettings) {
            this.settings = {};
            Object.assign(this.settings, registrationSettings);
        }
        Object.defineProperty(TypeRegistrationSettings.prototype, "key", {
            get: function () {
                return this.settings.key;
            },
            set: function (value) {
                this.settings.key = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "type", {
            get: function () {
                return this.settings.type;
            },
            set: function (value) {
                this.settings.type = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "object", {
            get: function () {
                return this.settings.object;
            },
            set: function (value) {
                this.settings.object = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "factory", {
            get: function () {
                return this.settings.factory;
            },
            set: function (value) {
                this.settings.factory = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "resolver", {
            get: function () {
                return this._getCurrentOrDefault('resolver');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "module", {
            get: function () {
                return this._getCurrentOrDefault('module');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "config", {
            get: function () {
                return this._getCurrentOrDefault('config');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "dependencies", {
            get: function () {
                return this._getCurrentOrDefaultArray('dependencies');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "ownedDependencies", {
            get: function () {
                return this._getCurrentOrDefaultArray('ownedDependencies');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "lazyDependencies", {
            get: function () {
                return this._getCurrentOrDefaultArray('lazyDependencies');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "lazyDependenciesAsync", {
            get: function () {
                return this._getCurrentOrDefaultArray('lazyDependenciesAsync');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "isSingleton", {
            get: function () {
                return this._getCurrentOrDefault('isSingleton');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "isObject", {
            get: function () {
                return this._getCurrentOrDefault('isObject');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "isFactory", {
            get: function () {
                return this._getCurrentOrDefault('isFactory');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "wantsInjection", {
            get: function () {
                return this._getCurrentOrDefault('wantsInjection');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "injectInto", {
            get: function () {
                return this._getCurrentOrDefault('injectInto');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "functionsToBind", {
            get: function () {
                return this._getCurrentOrDefaultArray('functionsToBind');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeRegistrationSettings.prototype, "overwrittenKeys", {
            get: function () {
                return this._getCurrentOrDefaultIndexer('overwrittenKeys');
            },
            enumerable: true,
            configurable: true
        });
        TypeRegistrationSettings.prototype._getCurrentOrDefault = function (key) {
            return typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
        };
        TypeRegistrationSettings.prototype._getCurrentOrDefaultArray = function (key) {
            var defaultValue = typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
            return defaultValue || [];
        };
        TypeRegistrationSettings.prototype._getCurrentOrDefaultIndexer = function (key) {
            var defaultValue = typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
            if (!defaultValue) {
                var value = {};
                this.settings[key] = value;
                return value;
            }
            return defaultValue;
        };
        return TypeRegistrationSettings;
    }());
    exports.TypeRegistrationSettings = TypeRegistrationSettings;
});

//# sourceMappingURL=type_registration_settings.js.map
