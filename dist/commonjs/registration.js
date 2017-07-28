"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Registration = (function () {
    function Registration(settings) {
        this._settings = this._ensureSettings(settings);
    }
    Registration.prototype._ensureSettings = function (settings) {
        var baseSettings = {
            overwrittenKeys: {},
            tags: {},
        };
        return Object.assign(baseSettings, settings);
    };
    Object.defineProperty(Registration.prototype, "settings", {
        get: function () {
            return this._settings;
        },
        enumerable: true,
        configurable: true
    });
    Registration.prototype.configure = function (config) {
        this.settings.config = config;
        return this;
    };
    Registration.prototype.dependencies = function () {
        var dependencies = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            dependencies[_i] = arguments[_i];
        }
        this.settings.dependencies = dependencies;
        return this;
    };
    Registration.prototype.singleton = function (isSingleton) {
        if (isSingleton === void 0) { isSingleton = true; }
        this.settings.isSingleton = isSingleton;
        return this;
    };
    Registration.prototype.transient = function (isTransient) {
        if (isTransient === void 0) { isTransient = true; }
        this.settings.isSingleton = !isTransient;
        return this;
    };
    Registration.prototype.injectLazy = function () {
        var lazyDependencies = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lazyDependencies[_i] = arguments[_i];
        }
        this.settings.lazyDependencies = lazyDependencies;
        this.settings.wantsLazyInjection = true;
        return this;
    };
    Registration.prototype.injectPromiseLazy = function () {
        var lazyPromiseDependencies = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lazyPromiseDependencies[_i] = arguments[_i];
        }
        this.settings.lazyDependenciesAsync = lazyPromiseDependencies;
        this.settings.wantsLazyInjectionAsync = true;
        return this;
    };
    Registration.prototype.injectInto = function (targetFunction) {
        this.settings.injectInto = targetFunction;
        return this;
    };
    Registration.prototype.bindFunctions = function () {
        var functionsToBind = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            functionsToBind[_i] = arguments[_i];
        }
        this.settings.functionsToBind = functionsToBind;
        return this;
    };
    Registration.prototype.tags = function () {
        var tags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tags[_i] = arguments[_i];
        }
        for (var _a = 0, tags_1 = tags; _a < tags_1.length; _a++) {
            var tag = tags_1[_a];
            if (!this.settings.tags[tag]) {
                this.settings.tags[tag] = {};
            }
        }
        return this;
    };
    Registration.prototype.setTag = function (tag, value) {
        this.settings.tags[tag] = value;
        return this;
    };
    Registration.prototype.overwrite = function (originalKey, overwrittenKey) {
        this.settings.overwrittenKeys[originalKey] = overwrittenKey;
        return this;
    };
    Registration.prototype.owns = function () {
        var ownedDependencies = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ownedDependencies[_i] = arguments[_i];
        }
        this.settings.ownedDependencies = ownedDependencies;
        return this;
    };
    Registration.prototype.withResolver = function (resolver) {
        this.settings.resolver = resolver;
        return this;
    };
    return Registration;
}());
exports.Registration = Registration;

//# sourceMappingURL=registration.js.map
