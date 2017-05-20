System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Registration;
    return {
        setters: [],
        execute: function () {
            Registration = (function () {
                function Registration(settings) {
                    this._settings = this._ensureSettings(settings);
                }
                Registration.prototype._ensureSettings = function (settings) {
                    var baseSettings = {
                        overwrittenKeys: {},
                        tags: {}
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
                    this.settings.lazyPromiseDependencies = lazyPromiseDependencies;
                    this.settings.wantsPromiseLazyInjection = true;
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
                    var _this = this;
                    var tags = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        tags[_i] = arguments[_i];
                    }
                    tags.forEach(function (tag) {
                        if (!_this.settings.tags[tag]) {
                            _this.settings.tags[tag] = {};
                        }
                    });
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
                return Registration;
            }());
            exports_1("Registration", Registration);
        }
    };
});

//# sourceMappingURL=registration.js.map
