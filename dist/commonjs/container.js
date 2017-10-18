"use strict";
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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var default_settings_1 = require("./default_settings");
var registry_1 = require("./registry");
var utils_1 = require("./utils");
var uuid = require("node-uuid");
var Container = (function (_super) {
    __extends(Container, _super);
    function Container(settings, parentContainer, parentRegistry) {
        if (settings === void 0) { settings = default_settings_1.defaultSettings; }
        var _this = _super.call(this, settings, parentRegistry) || this;
        _this.instances = {};
        _this.parentContainer = parentContainer;
        _this.settings = Object.assign(Object.assign({}, default_settings_1.defaultSettings), settings);
        _this.initialize();
        return _this;
    }
    Container.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.instances = {};
        this.settings = this._mergeSettings(default_settings_1.defaultSettings, this.settings);
        this.registerObject(this.settings.containerRegistrationKey, this);
    };
    Container.prototype.clear = function () {
        _super.prototype.clear.call(this);
        this.initialize();
    };
    Container.prototype._orderDependencies = function (registration, results, nest) {
        if (nest === void 0) { nest = []; }
        for (var _i = 0, _a = registration.settings.dependencies; _i < _a.length; _i++) {
            var dependencyKey = _a[_i];
            if (results.order.indexOf(dependencyKey) !== -1) {
                return;
            }
            var dependency = this.getRegistration(dependencyKey);
            if (!dependency) {
                results.missing.push(dependencyKey);
            }
            else if (nest.indexOf(dependencyKey) > -1) {
                nest.push(dependencyKey);
                results.recursive.push(nest.slice(0));
                nest.pop();
            }
            else if (dependency.settings.dependencies.length) {
                nest.push(dependencyKey);
                this._orderDependencies(dependency, results, nest);
                nest.pop();
            }
            results.order.push(dependencyKey);
        }
    };
    Container.prototype.validateDependencies = function () {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        var validationKeys = keys.length > 0 ? keys : this.getRegistrationKeys();
        var errors = [];
        for (var _a = 0, validationKeys_1 = validationKeys; _a < validationKeys_1.length; _a++) {
            var key = validationKeys_1[_a];
            var registration = this.getRegistration(key);
            var results = {
                order: [],
                missing: [],
                recursive: [],
            };
            errors.concat(this._valDependencies(registration, results));
            if (results.missing.length > 0) {
                for (var _b = 0, _c = results.missing; _b < _c.length; _b++) {
                    var miss = _c[_b];
                    errors.push("registration for key \"" + miss + "\" is missing");
                }
            }
            if (results.recursive.length > 0) {
                for (var _d = 0, _e = results.recursive; _d < _e.length; _d++) {
                    var recurs = _e[_d];
                    errors.push("recursive dependency detected: " + recurs.join(' -> '));
                }
            }
        }
        if (errors.length > 0) {
            console.log('.................');
            console.log(errors);
            console.log('.................');
            throw new Error('validation failed');
        }
        return errors;
    };
    Container.prototype._valDependencies = function (registration, results, nest) {
        if (nest === void 0) { nest = []; }
        var errors = [];
        errors.concat(this._validateOverwrittenKeys(registration));
        for (var _i = 0, _a = registration.settings.dependencies; _i < _a.length; _i++) {
            var dependencyKey = _a[_i];
            dependencyKey = this._getDependencyKeyOverwritten(registration, dependencyKey);
            if (results.order.indexOf(dependencyKey) !== -1) {
                return;
            }
            var dependency = this.getRegistration(dependencyKey);
            if (!dependency) {
                results.missing.push(dependencyKey);
            }
            else if (nest.indexOf(dependency) > -1) {
                if (!this._historyHasCircularBreak(nest, dependency)) {
                    nest.push(dependency);
                    results.recursive.push(nest.slice(0).map(function (recursiveRegistration) { return recursiveRegistration.settings.key; }));
                    nest.pop();
                }
            }
            else if (dependency.settings.dependencies.length) {
                nest.push(dependency);
                errors.concat(this._valDependencies(dependency, results, nest));
                nest.pop();
            }
            results.order.push(dependencyKey);
        }
        return errors;
    };
    Container.prototype._createNewResolutionContext = function (registration) {
        var id = this._createInstanceId();
        var currentResolution = {
            id: id,
            registration: registration,
            ownedInstances: [],
        };
        var resolutionContext = {
            currentResolution: currentResolution,
            instanceLookup: {},
            instanceResolutionOrder: [],
        };
        resolutionContext.instanceLookup[id] = currentResolution;
        return resolutionContext;
    };
    Container.prototype.resolve = function (key, injectionArgs, config) {
        if (injectionArgs === void 0) { injectionArgs = []; }
        var registration = this.getRegistration(key);
        if (!registration) {
            throw new Error("registration for key \"" + key + "\" not found");
        }
        var resolutionContext = this._createNewResolutionContext(registration);
        return this._resolve(registration, resolutionContext, injectionArgs, config);
    };
    Container.prototype.resolveAsync = function (key, injectionArgs, config) {
        if (injectionArgs === void 0) { injectionArgs = []; }
        var registration = this.getRegistration(key);
        if (!registration) {
            throw new Error("registration for key \"" + key + "\" not found");
        }
        var resolutionContext = this._createNewResolutionContext(registration);
        return this._resolveAsync(registration, resolutionContext, injectionArgs, config);
    };
    Container.prototype._resolve = function (registration, resolutionContext, injectionArgs, config) {
        if (injectionArgs === void 0) { injectionArgs = []; }
        if (registration.settings.isObject) {
            return this._resolveObject(registration, resolutionContext, injectionArgs, config);
        }
        if (registration.settings.isFactory) {
            return this._resolveFactory(registration, resolutionContext, injectionArgs, config);
        }
        return this._resolveTypeInstance(registration, resolutionContext, injectionArgs, config);
    };
    Container.prototype._resolveAsync = function (registration, resolutionContext, injectionArgs, config) {
        if (injectionArgs === void 0) { injectionArgs = []; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!registration.settings.isObject) return [3, 2];
                        return [4, this._resolveObjectAsync(registration, resolutionContext, injectionArgs, config)];
                    case 1: return [2, _a.sent()];
                    case 2:
                        if (!registration.settings.isFactory) return [3, 4];
                        return [4, this._resolveFactoryAsync(registration, resolutionContext, injectionArgs, config)];
                    case 3: return [2, _a.sent()];
                    case 4: return [4, this._resolveTypeInstanceAsync(registration, resolutionContext, injectionArgs, config)];
                    case 5: return [2, _a.sent()];
                }
            });
        });
    };
    Container.prototype.resolveLazy = function (key, injectionArgs, config) {
        if (injectionArgs === void 0) { injectionArgs = []; }
        var registration = this.getRegistration(key);
        if (!registration) {
            throw new Error("registration for key \"" + key + "\" not found");
        }
        var resolutionContext = this._createNewResolutionContext(registration);
        return this._resolveLazy(registration, resolutionContext, injectionArgs, config);
    };
    Container.prototype.resolveLazyAsync = function (key, injectionArgs, config) {
        if (injectionArgs === void 0) { injectionArgs = []; }
        var registration = this.getRegistration(key);
        if (!registration) {
            throw new Error("registration for key \"" + key + "\" not found");
        }
        var resolutionContext = this._createNewResolutionContext(registration);
        return this._resolveLazyAsync(registration, resolutionContext, injectionArgs, config);
    };
    Container.prototype._resolveLazy = function (registration, resolutionContext, injectionArgs, config) {
        var _this = this;
        if (injectionArgs === void 0) { injectionArgs = []; }
        return function (lazyInjectionArgs, lazyConfig) {
            var injectionArgsUsed = _this._mergeArguments(injectionArgs, lazyInjectionArgs);
            var lazyConfigUsed = _this._mergeConfigs(config, lazyConfig);
            return _this._resolve(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
        };
    };
    Container.prototype._resolveLazyAsync = function (registration, resolutionContext, injectionArgs, config) {
        var _this = this;
        if (injectionArgs === void 0) { injectionArgs = []; }
        return function (lazyInjectionArgs, lazyConfig) {
            var injectionArgsUsed = _this._mergeArguments(injectionArgs, lazyInjectionArgs);
            var lazyConfigUsed = _this._mergeConfigs(config, lazyConfig);
            return _this._resolveAsync(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
        };
    };
    Container.prototype._resolveObject = function (registration, resolutionContext, injectionArgs, config) {
        var configUsed = this._mergeRegistrationConfig(registration, config);
        var dependencies = this._resolveDependencies(registration, resolutionContext);
        var object = this._createObject(registration, dependencies, injectionArgs);
        this._configureInstance(object, registration, configUsed);
        return object;
    };
    Container.prototype._resolveObjectAsync = function (registration, resolutionContext, injectionArgs, config) {
        return __awaiter(this, void 0, void 0, function () {
            var configUsed, dependencies, object;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configUsed = this._mergeRegistrationConfig(registration, config);
                        dependencies = this._resolveDependencies(registration, resolutionContext);
                        return [4, this._createObjectAsync(registration, dependencies, injectionArgs)];
                    case 1:
                        object = _a.sent();
                        this._configureInstance(object, registration, configUsed);
                        return [2, object];
                }
            });
        });
    };
    Container.prototype._resolveFactory = function (registration, resolutionContext, injectionArgs, config) {
        var configUsed = this._mergeRegistrationConfig(registration, config);
        var dependencies = this._resolveDependencies(registration, resolutionContext);
        var factory = this._createFactory(registration, dependencies, injectionArgs);
        this._configureInstance(factory, registration, configUsed);
        return factory;
    };
    Container.prototype._resolveFactoryAsync = function (registration, resolutionContext, injectionArgs, config) {
        return __awaiter(this, void 0, void 0, function () {
            var configUsed, dependencies, factory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configUsed = this._mergeRegistrationConfig(registration, config);
                        dependencies = this._resolveDependencies(registration, resolutionContext);
                        return [4, this._createFactoryAsync(registration, dependencies, injectionArgs)];
                    case 1:
                        factory = _a.sent();
                        this._configureInstance(factory, registration, configUsed);
                        return [2, factory];
                }
            });
        });
    };
    Container.prototype._resolveTypeInstance = function (registration, resolutionContext, injectionArgs, config) {
        var configUsed = this._mergeRegistrationConfig(registration, config);
        if (registration.settings.isSingleton) {
            return this._getTypeInstance(registration, resolutionContext, injectionArgs, configUsed);
        }
        return this._getNewTypeInstance(registration, resolutionContext, injectionArgs, configUsed);
    };
    Container.prototype._resolveTypeInstanceAsync = function (registration, resolutionContext, injectionArgs, config) {
        return __awaiter(this, void 0, void 0, function () {
            var configUsed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configUsed = this._mergeRegistrationConfig(registration, config);
                        if (!registration.settings.isSingleton) return [3, 2];
                        return [4, this._getTypeInstanceAsync(registration, resolutionContext, injectionArgs, configUsed)];
                    case 1: return [2, _a.sent()];
                    case 2: return [4, this._getNewTypeInstanceAsync(registration, resolutionContext, injectionArgs, configUsed)];
                    case 3: return [2, _a.sent()];
                }
            });
        });
    };
    Container.prototype._getTypeInstance = function (registration, resolutionContext, injectionArgs, config) {
        if (injectionArgs === void 0) { injectionArgs = []; }
        var instances = this._getCachedInstances(registration, injectionArgs, config);
        if (instances.length === 0) {
            return this._getNewTypeInstance(registration, resolutionContext, injectionArgs, config);
        }
        return instances[0];
    };
    Container.prototype._getTypeInstanceAsync = function (registration, resolutionContext, injectionArgs, config) {
        if (injectionArgs === void 0) { injectionArgs = []; }
        return __awaiter(this, void 0, void 0, function () {
            var instances;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        instances = this._getCachedInstances(registration, injectionArgs, config);
                        if (!(instances.length === 0)) return [3, 2];
                        return [4, this._getNewTypeInstanceAsync(registration, resolutionContext, injectionArgs, config)];
                    case 1: return [2, _a.sent()];
                    case 2: return [2, instances[0]];
                }
            });
        });
    };
    Container.prototype._getNewTypeInstance = function (registration, resolutionContext, injectionArgs, config) {
        if (injectionArgs === void 0) { injectionArgs = []; }
        var configUsed = this._mergeRegistrationConfig(registration, config);
        this._validateResolutionContext(registration, resolutionContext);
        var dependencies = this._resolveDependencies(registration, resolutionContext);
        var instance = this._createType(registration, dependencies, injectionArgs);
        this._configureInstance(instance, registration, configUsed);
        this._cacheInstance(registration, resolutionContext, instance, injectionArgs, config);
        return instance;
    };
    Container.prototype._getNewTypeInstanceAsync = function (registration, resolutionContext, injectionArgs, config) {
        if (injectionArgs === void 0) { injectionArgs = []; }
        return __awaiter(this, void 0, void 0, function () {
            var configUsed, dependencies, instance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configUsed = this._mergeRegistrationConfig(registration, config);
                        this._validateResolutionContext(registration, resolutionContext);
                        return [4, this._resolveDependenciesAsync(registration, resolutionContext)];
                    case 1:
                        dependencies = _a.sent();
                        return [4, this._createType(registration, dependencies, injectionArgs)];
                    case 2:
                        instance = _a.sent();
                        this._configureInstance(instance, registration, configUsed);
                        this._cacheInstance(registration, resolutionContext, instance, injectionArgs, config);
                        return [2, instance];
                }
            });
        });
    };
    Container.prototype._validateResolutionContext = function (registration, resolutionContext) {
    };
    Container.prototype._resolveDependencies = function (registration, resolutionContext) {
        var resolvedDependencies = [];
        var dependencies = registration.settings.dependencies || [];
        for (var _i = 0, dependencies_1 = dependencies; _i < dependencies_1.length; _i++) {
            var dependencyKey = dependencies_1[_i];
            var resolvedDependency = this._resolveDependency(registration, dependencyKey, resolutionContext);
            resolvedDependencies.push(resolvedDependency);
        }
        return resolvedDependencies;
    };
    Container.prototype._resolveDependenciesAsync = function (registration, resolutionContext) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvedDependencies, dependencies, _i, dependencies_2, dependencyKey, resolvedDependency;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resolvedDependencies = [];
                        dependencies = registration.settings.dependencies || [];
                        _i = 0, dependencies_2 = dependencies;
                        _a.label = 1;
                    case 1:
                        if (!(_i < dependencies_2.length)) return [3, 4];
                        dependencyKey = dependencies_2[_i];
                        return [4, this._resolveDependencyAsync(registration, dependencyKey, resolutionContext)];
                    case 2:
                        resolvedDependency = _a.sent();
                        resolvedDependencies.push(resolvedDependency);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4: return [2, resolvedDependencies];
                }
            });
        });
    };
    Container.prototype._resolveDependency = function (registration, dependencyKey, resolutionContext) {
        var newResolutionContext = this._createChildResolutionContext(registration, resolutionContext);
        var overwrittenDependencyKey = this._getDependencyKeyOverwritten(registration, dependencyKey);
        var dependencyRegistration = this.getRegistration(overwrittenDependencyKey);
        if (!dependencyRegistration) {
            throw new Error("dependency \"" + overwrittenDependencyKey + "\" of key \"" + registration.settings.key + "\" is missing");
        }
        var isOwned = this._isDependencyOwned(registration, overwrittenDependencyKey);
        if (isOwned) {
            newResolutionContext.currentResolution.ownedBy = resolutionContext.currentResolution.id;
            resolutionContext.currentResolution.ownedInstances.push(newResolutionContext.currentResolution.id);
        }
        if (this._isDependencyLazy(registration, overwrittenDependencyKey)) {
            return this._resolveLazy(dependencyRegistration, newResolutionContext, undefined, undefined);
        }
        if (this._isDependencyLazyAsync(registration, overwrittenDependencyKey)) {
            return this._resolveLazyAsync(dependencyRegistration, newResolutionContext, undefined, undefined);
        }
        return this._resolve(dependencyRegistration, newResolutionContext, undefined, undefined);
    };
    Container.prototype._resolveDependencyAsync = function (registration, dependencyKey, resolutionContext) {
        return __awaiter(this, void 0, void 0, function () {
            var newResolutionContext, overwrittenDependencyKey, dependencyRegistration, isOwned;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newResolutionContext = this._createChildResolutionContext(registration, resolutionContext);
                        overwrittenDependencyKey = this._getDependencyKeyOverwritten(registration, dependencyKey);
                        dependencyRegistration = this.getRegistration(dependencyKey);
                        newResolutionContext.currentResolution.registration = dependencyRegistration;
                        if (!this._isDependencyLazy(registration, dependencyKey)) return [3, 2];
                        return [4, this._resolveLazy(dependencyRegistration, newResolutionContext, undefined, undefined)];
                    case 1: return [2, _a.sent()];
                    case 2:
                        if (!this._isDependencyLazyAsync(registration, dependencyKey)) return [3, 4];
                        return [4, this._resolveLazyAsync(dependencyRegistration, newResolutionContext, undefined, undefined)];
                    case 3: return [2, _a.sent()];
                    case 4:
                        isOwned = this._isDependencyOwned(registration, overwrittenDependencyKey);
                        if (isOwned) {
                            newResolutionContext.currentResolution.ownedBy = resolutionContext.currentResolution.id;
                            resolutionContext.currentResolution.ownedInstances.push(newResolutionContext.currentResolution.id);
                        }
                        return [4, this._resolveAsync(dependencyRegistration, newResolutionContext, undefined, undefined)];
                    case 5: return [2, _a.sent()];
                }
            });
        });
    };
    Container.prototype._createObject = function (registration, dependencies, injectionArgs) {
        var resolver = this._getResolver(registration);
        var object = resolver.resolveObject(this, registration);
        var createdObject = resolver.createObject(this, object, registration, dependencies, injectionArgs);
        return createdObject;
    };
    Container.prototype._createObjectAsync = function (registration, dependencies, injectionArgs) {
        return __awaiter(this, void 0, void 0, function () {
            var resolver, object, createdObject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resolver = this._getResolver(registration);
                        return [4, resolver.resolveObjectAsync(this, registration)];
                    case 1:
                        object = _a.sent();
                        createdObject = resolver.createObject(this, object, registration, dependencies, injectionArgs);
                        return [2, createdObject];
                }
            });
        });
    };
    Container.prototype._createFactory = function (registration, dependencies, injectionArgs) {
        var resolver = this._getResolver(registration);
        var type = resolver.resolveFactory(this, registration);
        var factory = resolver.createFactory(this, type, registration, dependencies, injectionArgs);
        return factory;
    };
    Container.prototype._createFactoryAsync = function (registration, dependencies, injectionArgs) {
        return __awaiter(this, void 0, void 0, function () {
            var resolver, type, factory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resolver = this._getResolver(registration);
                        return [4, resolver.resolveFactoryAsync(this, registration)];
                    case 1:
                        type = _a.sent();
                        factory = resolver.createFactory(this, type, registration, dependencies, injectionArgs);
                        return [2, factory];
                }
            });
        });
    };
    Container.prototype._createType = function (registration, dependencies, injectionArgs) {
        var resolver = this._getResolver(registration);
        var type = resolver.resolveType(this, registration);
        var factory = resolver.createInstance(this, type, registration, dependencies, injectionArgs);
        return factory;
    };
    Container.prototype._createTypeAsync = function (registration, dependencies, injectionArgs) {
        return __awaiter(this, void 0, void 0, function () {
            var resolver, type, instance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resolver = this._getResolver(registration);
                        return [4, resolver.resolveTypeAsync(this, registration)];
                    case 1:
                        type = _a.sent();
                        instance = resolver.createInstance(this, type, registration, dependencies, injectionArgs);
                        return [2, instance];
                }
            });
        });
    };
    Container.prototype._getResolver = function (registration) {
        return registration.settings.resolver || this.settings.resolver;
    };
    Container.prototype._configureInstance = function (instance, registration, runtimeConfig) {
        if (!registration.settings.config && !runtimeConfig) {
            return;
        }
        var configPropertyDescriptor = utils_1.getPropertyDescriptor(instance, 'config');
        if (configPropertyDescriptor === undefined || (!configPropertyDescriptor.writable && !configPropertyDescriptor.set)) {
            var instancePrototype = Object.getPrototypeOf(instance);
            throw new Error("The setter for the config property on type '" + instancePrototype.constructor.name + "' is missing.");
        }
        var resolver = this._getResolver(registration);
        var resolvedConfig = resolver.resolveConfig(registration.settings.config);
        var resultConfig = runtimeConfig ? this._mergeConfigs(resolvedConfig, runtimeConfig) : resolvedConfig;
        instance.config = resultConfig;
    };
    Container.prototype._getCachedInstances = function (registration, injectionArgs, config) {
        var key = registration.settings.key;
        var resolver = this._getResolver(registration);
        if (!this.instances) {
            this.instances = {};
        }
        if (registration.settings.isTrueSingleton) {
            return this.instances[key];
        }
        var allInstances = this.instances[key];
        if (!allInstances) {
            return [];
        }
        var configHash = resolver.hashConfig(config);
        var configInstances = allInstances[configHash];
        if (!configInstances) {
            return [];
        }
        var injectionArgsHash = this._hashInjectionArgs(injectionArgs, resolver);
        var argumentInstances = configInstances[injectionArgsHash];
        if (!argumentInstances) {
            return [];
        }
        return argumentInstances;
    };
    Container.prototype._createInstanceId = function () {
        return uuid.v4();
    };
    Container.prototype._cacheInstance = function (registration, resolutionContext, instance, injectionArgs, config) {
        var key = registration.settings.key;
        if (!resolutionContext.instanceLookup) {
            resolutionContext.instanceLookup = {};
        }
        resolutionContext.currentResolution.instance = instance;
        resolutionContext.currentResolution.registration = registration;
        resolutionContext.instanceResolutionOrder.push(resolutionContext.currentResolution);
        if (!registration.settings.isSingleton) {
            return;
        }
        var resolver = this._getResolver(registration);
        if (!this.instances) {
            this.instances = {};
        }
        var allInstances = this.instances[key];
        if (registration.settings.isTrueSingleton) {
            this.instances[key] = instance;
            return;
        }
        if (!allInstances) {
            allInstances = this.instances[key] = {};
        }
        var configHash = resolver.hashConfig(config);
        var configInstances = allInstances[configHash];
        if (!configInstances) {
            configInstances = allInstances[configHash] = {};
        }
        var injectionArgsHash = this._hashInjectionArgs(injectionArgs, resolver);
        var argumentInstances = configInstances[injectionArgsHash];
        if (!argumentInstances) {
            argumentInstances = configInstances[injectionArgsHash] = [];
        }
        argumentInstances.push(instance);
    };
    Container.prototype._hashInjectionArgs = function (injectionArgs, resolver) {
        var injectionArgsHashes = injectionArgs.map(function (injectionArgument) {
            var hashResult;
            try {
                hashResult = resolver.hash(injectionArgs);
            }
            catch (error) {
                hashResult = '--';
            }
            return hashResult;
        });
        var injectionArgsHash = injectionArgsHashes.join('__');
        return injectionArgsHash;
    };
    Container.prototype.validateDependencies2 = function () {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        var validationKeys = keys.length > 0 ? keys : this.getRegistrationKeys();
        var errors = this._validateDependencies(validationKeys);
        if (errors.length > 0) {
            console.log('.................');
            console.log(errors);
            console.log('.................');
            throw new Error('validation failed');
        }
        return errors;
    };
    Container.prototype._validateDependencies = function (keys, history) {
        if (history === void 0) { history = []; }
        var errors = [];
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            var registration = this.getRegistration(key);
            if (!registration) {
                errors.push("registration for key '" + key + "' is missing.");
                return;
            }
            if (history.indexOf(registration) > 0) {
                errors.push("circular dependency on key '" + registration.settings.key + "' detected.");
                return;
            }
            history.push(registration);
            if (!registration.settings.dependencies) {
                return;
            }
            for (var _a = 0, _b = registration.settings.dependencies; _a < _b.length; _a++) {
                var dependencyKey = _b[_a];
                var deepErrors = this._validateDependency(registration, dependencyKey, history);
                Array.prototype.push.apply(errors, deepErrors);
            }
        }
        return errors;
    };
    Container.prototype._validateDependency = function (registration, dependencyKey, history) {
        var newRegistrationHistory = [];
        Array.prototype.push.apply(newRegistrationHistory, history);
        var errors = [];
        var dependencyKeyOverwritten = this._getDependencyKeyOverwritten(registration, dependencyKey);
        var dependency = this.getRegistration(dependencyKeyOverwritten);
        if (!dependency) {
            errors.push("dependency '" + dependencyKeyOverwritten + "' declared on '" + registration.settings.key + "' is missing.");
        }
        else {
            var overwrittenKeyValidationErrors = this._validateOverwrittenKeys(dependency);
            Array.prototype.push.apply(errors, overwrittenKeyValidationErrors);
            if (dependency.settings.dependencies) {
                var circularBreakFound = this._historyHasCircularBreak(newRegistrationHistory, dependency);
                if (!circularBreakFound) {
                    var deepErrors = this._validateDependencies(dependency.settings.dependencies, newRegistrationHistory);
                    Array.prototype.push.apply(errors, deepErrors);
                }
            }
        }
        return errors;
    };
    Container.prototype._historyHasCircularBreak = function (history, dependency) {
        var _this = this;
        return history.some(function (parentRegistration) {
            var parentSettings = parentRegistration.settings;
            if (_this.settings.circularDependencyCanIncludeSingleton && parentSettings.isSingleton) {
                return true;
            }
            if (_this.settings.circularDependencyCanIncludeLazy && parentSettings.wantsLazyInjection) {
                if (parentSettings.wantsLazyInjection ||
                    parentSettings.lazyDependencies.indexOf(dependency.settings.key) >= 0) {
                    return true;
                }
                if (parentSettings.wantsLazyInjectionAsync ||
                    parentSettings.lazyDependenciesAsync.indexOf(dependency.settings.key) >= 0) {
                    return true;
                }
            }
        });
    };
    Container.prototype._validateOverwrittenKeys = function (registration) {
        var overwrittenKeys = Object.keys(registration.settings.overwrittenKeys);
        var errors = [];
        for (var _i = 0, overwrittenKeys_1 = overwrittenKeys; _i < overwrittenKeys_1.length; _i++) {
            var overwrittenKey = overwrittenKeys_1[_i];
            var keyErrors = this._validateOverwrittenKey(registration, overwrittenKey);
            Array.prototype.push.apply(errors, keyErrors);
        }
        return errors;
    };
    Container.prototype._validateOverwrittenKey = function (registration, overwrittenKey) {
        var errors = [];
        if (registration.settings.dependencies.indexOf(overwrittenKey) < 0) {
            var errorMessage = "No dependency for overwritten key '" + overwrittenKey + "' has been declared on registration for key '" + registration.settings.key + "'.";
            errors.push(errorMessage);
        }
        var overwrittenKeyValue = registration.settings.overwrittenKeys[overwrittenKey];
        var overwrittenKeyRegistration = this.getRegistration(overwrittenKeyValue);
        if (!overwrittenKeyRegistration) {
            var errorMessage = "Registration for overwritten key '" + overwrittenKey + "' declared on registration for key '" + registration.settings.key + "' is missing.";
            errors.push(errorMessage);
        }
        return errors;
    };
    Container.prototype._mergeArguments = function (existingArgs, newArgs) {
        if (existingArgs === void 0) { existingArgs = []; }
        if (newArgs === void 0) { newArgs = []; }
        var finalArgs = [];
        Array.prototype.push.apply(finalArgs, existingArgs);
        Array.prototype.push.apply(finalArgs, newArgs);
        return finalArgs;
    };
    Container.prototype._mergeConfigs = function (existingConfig, newConfig) {
        if (!existingConfig) {
            return newConfig;
        }
        if (!newConfig) {
            return existingConfig;
        }
        return __assign({}, existingConfig, newConfig);
    };
    Container.prototype._mergeRegistrationConfig = function (registration, config) {
        var registrationConfig = this._resolveConfig(registration, registration.settings.config);
        var runtimeConfig = this._resolveConfig(registration, config);
        var configUsed = this._mergeConfigs(registrationConfig, runtimeConfig);
        return configUsed;
    };
    Container.prototype._resolveConfig = function (registration, config) {
        var resolver = this._getResolver(registration);
        return resolver.resolveConfig(config);
    };
    Container.prototype._createChildResolutionContext = function (registration, resolutionContext) {
        var newResolutionContext = this._cloneResolutionContext(resolutionContext);
        var id = this._createInstanceId();
        newResolutionContext.currentResolution = {
            id: id,
            registration: registration,
        };
        resolutionContext.instanceLookup[id] = newResolutionContext.currentResolution;
        var ownedDependencies = registration.settings.ownedDependencies || [];
        return newResolutionContext;
    };
    Container.prototype._cloneResolutionContext = function (resolutionContext) {
        return Object.assign({}, resolutionContext);
    };
    Container.prototype._isDependencyLazy = function (registration, dependencyKey) {
        if (!registration.settings.wantsLazyInjection) {
            return false;
        }
        return registration.settings.lazyDependencies.length === 0 || registration.settings.lazyDependencies.indexOf(dependencyKey) >= 0;
    };
    Container.prototype._isDependencyLazyAsync = function (registration, dependencyKey) {
        if (!registration.settings.wantsLazyInjectionAsync) {
            return false;
        }
        return registration.settings.lazyDependenciesAsync.length === 0 || registration.settings.lazyDependenciesAsync.indexOf(dependencyKey) >= 0;
    };
    Container.prototype._isDependencyOwned = function (registration, dependencyKey) {
        if (!registration.settings.ownedDependencies) {
            return false;
        }
        return registration.settings.ownedDependencies.length !== 0 && registration.settings.ownedDependencies.indexOf(dependencyKey) >= 0;
    };
    Container.prototype._getDependencyKeyOverwritten = function (registration, dependencyKey) {
        var finalDependencyKey = dependencyKey;
        if (registration.settings.overwrittenKeys[dependencyKey]) {
            finalDependencyKey = registration.settings.overwrittenKeys[dependencyKey];
        }
        return finalDependencyKey;
    };
    return Container;
}(registry_1.Registry));
exports.Container = Container;

//# sourceMappingURL=container.js.map
