var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RegistrationSettings = (function () {
        function RegistrationSettings(registrationSettings) {
            this.settings = {};
            Object.assign(this.settings, registrationSettings);
        }
        Object.defineProperty(RegistrationSettings.prototype, "key", {
            get: function () {
                return this.settings.key;
            },
            set: function (value) {
                this.settings.key = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "object", {
            get: function () {
                return this.settings.object;
            },
            set: function (value) {
                this.settings.object = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "factory", {
            get: function () {
                return this.settings.factory;
            },
            set: function (value) {
                this.settings.factory = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "resolver", {
            get: function () {
                return this._getCurrentOrDefault('resolver');
            },
            set: function (value) {
                this.settings.resolver = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "module", {
            get: function () {
                return this._getCurrentOrDefault('module');
            },
            set: function (value) {
                this.settings.module = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "config", {
            get: function () {
                return this._getCurrentOrDefault('config');
            },
            set: function (value) {
                this.settings.config = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "dependencies", {
            get: function () {
                return this._getCurrentOrDefaultArray('dependencies');
            },
            set: function (value) {
                this.settings.dependencies = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "ownedDependencies", {
            get: function () {
                return this._getCurrentOrDefaultArray('ownedDependencies');
            },
            set: function (value) {
                this.settings.ownedDependencies = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "lazyDependencies", {
            get: function () {
                return this._getCurrentOrDefaultArray('lazyDependencies');
            },
            set: function (value) {
                this.settings.lazyDependencies = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "lazyDependenciesAsync", {
            get: function () {
                return this._getCurrentOrDefaultArray('lazyDependenciesAsync');
            },
            set: function (value) {
                this.settings.lazyDependenciesAsync = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "isSingleton", {
            get: function () {
                return this._getCurrentOrDefault('isSingleton');
            },
            set: function (value) {
                this.settings.isSingleton = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "isObject", {
            get: function () {
                return this._getCurrentOrDefault('isObject');
            },
            set: function (value) {
                this.settings.isObject = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "isFactory", {
            get: function () {
                return this._getCurrentOrDefault('isFactory');
            },
            set: function (value) {
                this.settings.isFactory = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "wantsInjection", {
            get: function () {
                return this._getCurrentOrDefault('wantsInjection');
            },
            set: function (value) {
                this.settings.wantsInjection = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "injectInto", {
            get: function () {
                return this._getCurrentOrDefault('injectInto');
            },
            set: function (value) {
                this.settings.injectInto = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "functionsToBind", {
            get: function () {
                return this._getCurrentOrDefaultArray('functionsToBind');
            },
            set: function (value) {
                this.settings.functionsToBind = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegistrationSettings.prototype, "overwrittenKeys", {
            get: function () {
                return this._getCurrentOrDefaultIndexer('overwrittenKeys');
            },
            set: function (value) {
                this.settings.overwrittenKeys = value;
            },
            enumerable: true,
            configurable: true
        });
        RegistrationSettings.prototype._getCurrentOrDefault = function (key) {
            return typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
        };
        RegistrationSettings.prototype._getCurrentOrDefaultArray = function (key) {
            var defaultValue = typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
            return defaultValue || [];
        };
        RegistrationSettings.prototype._getCurrentOrDefaultIndexer = function (key) {
            var defaultValue = typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
            if (!defaultValue) {
                var value = {};
                this.settings[key] = value;
                return value;
            }
            return defaultValue;
        };
        return RegistrationSettings;
    }());
    exports.RegistrationSettings = RegistrationSettings;
    var TypeRegistrationSettings = (function (_super) {
        __extends(TypeRegistrationSettings, _super);
        function TypeRegistrationSettings(registrationSettings) {
            return _super.call(this, registrationSettings) || this;
        }
        Object.defineProperty(TypeRegistrationSettings.prototype, "settings", {
            get: function () {
                return this.settings;
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
        return TypeRegistrationSettings;
    }(RegistrationSettings));
    exports.TypeRegistrationSettings = TypeRegistrationSettings;
    var ObjectRegistrationSettings = (function (_super) {
        __extends(ObjectRegistrationSettings, _super);
        function ObjectRegistrationSettings(registrationSettings) {
            return _super.call(this, registrationSettings) || this;
        }
        Object.defineProperty(ObjectRegistrationSettings.prototype, "settings", {
            get: function () {
                return this.settings;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObjectRegistrationSettings.prototype, "object", {
            get: function () {
                return this.settings.object;
            },
            set: function (value) {
                this.settings.object = value;
            },
            enumerable: true,
            configurable: true
        });
        return ObjectRegistrationSettings;
    }(RegistrationSettings));
    exports.ObjectRegistrationSettings = ObjectRegistrationSettings;
    var FactoryRegistrationSettings = (function (_super) {
        __extends(FactoryRegistrationSettings, _super);
        function FactoryRegistrationSettings(registrationSettings) {
            return _super.call(this, registrationSettings) || this;
        }
        Object.defineProperty(FactoryRegistrationSettings.prototype, "settings", {
            get: function () {
                return this.settings;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FactoryRegistrationSettings.prototype, "object", {
            get: function () {
                return this.settings.object;
            },
            set: function (value) {
                this.settings.object = value;
            },
            enumerable: true,
            configurable: true
        });
        return FactoryRegistrationSettings;
    }(RegistrationSettings));
    exports.FactoryRegistrationSettings = FactoryRegistrationSettings;
});

//# sourceMappingURL=registration_settings.js.map
