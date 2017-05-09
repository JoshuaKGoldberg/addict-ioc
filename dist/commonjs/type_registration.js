"use strict";
var TypeRegistration = (function () {
    function TypeRegistration(settings) {
        this._settings = settings;
    }
    Object.defineProperty(TypeRegistration.prototype, "settings", {
        get: function () {
            return this._settings;
        },
        enumerable: true,
        configurable: true
    });
    TypeRegistration.prototype.configure = function (config) {
        this.settings.config = config;
        return this;
    };
    TypeRegistration.prototype.dependencies = function () {
        var dependencies = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            dependencies[_i] = arguments[_i];
        }
        this.settings.dependencies = dependencies;
        return this;
    };
    TypeRegistration.prototype.singleton = function (isSingleton) {
        if (isSingleton === void 0) { isSingleton = true; }
        this.settings.isSingleton = isSingleton;
        return this;
    };
    TypeRegistration.prototype.injectLazy = function () {
        var lazyDependencies = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lazyDependencies[_i] = arguments[_i];
        }
        this.settings.lazyDependencies = lazyDependencies;
        return this;
    };
    return TypeRegistration;
}());
exports.TypeRegistration = TypeRegistration;

//# sourceMappingURL=type_registration.js.map
