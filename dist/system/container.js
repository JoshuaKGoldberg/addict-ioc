System.register(["./registry", "./resolution_context", "./default_settings", "./utils"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
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
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
        return { next: verb(0), "throw": verb(1), "return": verb(2) };
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
    var __moduleName = context_1 && context_1.id;
    var registry_1, resolution_context_1, default_settings_1, utils_1, Container;
    return {
        setters: [
            function (registry_1_1) {
                registry_1 = registry_1_1;
            },
            function (resolution_context_1_1) {
                resolution_context_1 = resolution_context_1_1;
            },
            function (default_settings_1_1) {
                default_settings_1 = default_settings_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }
        ],
        execute: function () {
            Container = (function (_super) {
                __extends(Container, _super);
                function Container(settings, parentContainer, parentRegistry) {
                    if (settings === void 0) { settings = default_settings_1.DefaultSettings; }
                    var _this = _super.call(this, Object.assign(Object.assign({}, default_settings_1.DefaultSettings), settings), parentRegistry) || this;
                    _this.parentContainer = parentContainer;
                    _this.settings = Object.assign(Object.assign({}, default_settings_1.DefaultSettings), settings);
                    _this.initialize();
                    return _this;
                }
                Container.prototype.initialize = function () {
                    this.instances = new Map();
                    this.registerObject(this.settings.containerRegistrationKey, this);
                };
                Container.prototype.clear = function () {
                    _super.prototype.clear.call(this);
                    this.initialize();
                };
                Container.prototype.resolve = function (key, injectionArgs, config) {
                    if (injectionArgs === void 0) { injectionArgs = []; }
                    var registration = _super.prototype.getRegistration.call(this, key);
                    var resolutionContext = this._createNewResolutionContext(registration);
                    if (registration.settings.isObject) {
                        return this._resolveObject(registration, resolutionContext, injectionArgs, config);
                    }
                    if (registration.settings.isFactory) {
                        return this._resolveFactory(registration, resolutionContext, injectionArgs, config);
                    }
                    return this._resolveInstance(registration, resolutionContext, injectionArgs, config);
                };
                Container.prototype.resolveAsync = function (key, injectionArgs, config) {
                    if (injectionArgs === void 0) { injectionArgs = []; }
                    var registration = _super.prototype.getRegistration.call(this, key);
                    var resolutionContext = this._createNewResolutionContext(registration);
                    if (registration.settings.isObject) {
                        return this._resolveObjectAsync(registration, resolutionContext, injectionArgs, config);
                    }
                    if (registration.settings.isFactory) {
                        return this._resolveFactoryAsync(registration, resolutionContext, injectionArgs, config);
                    }
                    return this._resolveInstanceAsync(registration, resolutionContext, injectionArgs, config);
                };
                Container.prototype.resolveLazy = function (key, injectionArgs, config) {
                    if (injectionArgs === void 0) { injectionArgs = []; }
                    var registration = _super.prototype.getRegistration.call(this, key);
                    var resolutionContext = this._createNewResolutionContext(registration);
                    return this._resolveLazy(registration, resolutionContext, injectionArgs, config);
                };
                Container.prototype.resolveLazyAsync = function (key, injectionArgs, config) {
                    if (injectionArgs === void 0) { injectionArgs = []; }
                    var registration = _super.prototype.getRegistration.call(this, key);
                    var resolutionContext = this._createNewResolutionContext(registration);
                    return this._resolveLazyAsync(registration, resolutionContext, injectionArgs, config);
                };
                Container.prototype._resolveLazy = function (registration, resolutionContext, injectionArgs, config) {
                    var _this = this;
                    if (injectionArgs === void 0) { injectionArgs = []; }
                    return function (lazyInjectionArgs, lazyConfig) {
                        var injectionArgsUsed = _this._mergeArguments(injectionArgs, lazyInjectionArgs);
                        var lazyConfigUsed = _this._mergeConfigs(config, lazyConfig);
                        return _this._resolveInstance(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
                    };
                };
                Container.prototype._resolveLazyAsync = function (registration, resolutionContext, injectionArgs, config) {
                    var _this = this;
                    if (injectionArgs === void 0) { injectionArgs = []; }
                    return function (lazyInjectionArgs, lazyConfig) {
                        var injectionArgsUsed = _this._mergeArguments(injectionArgs, lazyInjectionArgs);
                        var lazyConfigUsed = _this._mergeConfigs(config, lazyConfig);
                        return _this._resolveInstanceAsync(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
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
                                    return [4 /*yield*/, this._createObjectAsync(registration, dependencies, injectionArgs)];
                                case 1:
                                    object = _a.sent();
                                    this._configureInstance(object, registration, configUsed);
                                    return [2 /*return*/, object];
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
                            configUsed = this._mergeRegistrationConfig(registration, config);
                            dependencies = this._resolveDependencies(registration, resolutionContext);
                            factory = this._createFactoryAsync(registration, dependencies, injectionArgs);
                            this._configureInstance(factory, registration, configUsed);
                            return [2 /*return*/, factory];
                        });
                    });
                };
                Container.prototype._resolveInstance = function (registration, resolutionContext, injectionArgs, config) {
                    var configUsed = this._mergeRegistrationConfig(registration, config);
                    if (registration.settings.isSingleton) {
                        return this._getInstance(registration, resolutionContext, injectionArgs, configUsed);
                    }
                    return this._getNewInstance(registration, resolutionContext, injectionArgs, configUsed);
                };
                Container.prototype._resolveInstanceAsync = function (registration, resolutionContext, injectionArgs, config) {
                    return __awaiter(this, void 0, void 0, function () {
                        var configUsed;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    configUsed = this._mergeRegistrationConfig(registration, config);
                                    if (!registration.settings.isSingleton) return [3 /*break*/, 2];
                                    return [4 /*yield*/, this._getInstanceAsync(registration, resolutionContext, injectionArgs, configUsed)];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2: return [4 /*yield*/, this._getNewInstanceAsync(registration, resolutionContext, injectionArgs, configUsed)];
                                case 3: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                Container.prototype._getInstance = function (registration, resolutionContext, injectionArgs, config) {
                    if (injectionArgs === void 0) { injectionArgs = []; }
                    var instances = this._getCachedInstances(registration, injectionArgs, config);
                    if (instances.length === 0) {
                        return this._getNewInstance(registration, resolutionContext, injectionArgs, config);
                    }
                    return instances[0];
                };
                Container.prototype._getInstanceAsync = function (registration, resolutionContext, injectionArgs, config) {
                    if (injectionArgs === void 0) { injectionArgs = []; }
                    return __awaiter(this, void 0, void 0, function () {
                        var instances;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    instances = this._getCachedInstances(registration, injectionArgs, config);
                                    if (!(instances.length === 0)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, this._getNewInstanceAsync(registration, resolutionContext, injectionArgs, config)];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2: return [2 /*return*/, instances[0]];
                            }
                        });
                    });
                };
                Container.prototype._getNewInstance = function (registration, resolutionContext, injectionArgs, config) {
                    if (injectionArgs === void 0) { injectionArgs = []; }
                    var configUsed = this._mergeRegistrationConfig(registration, config);
                    this._validateResolutionContext(registration, resolutionContext);
                    var dependencies = this._resolveDependencies(registration, resolutionContext);
                    var instance = this._createType(registration, dependencies, injectionArgs);
                    this._configureInstance(instance, registration, configUsed);
                    if (!resolutionContext.isDependencyOwned) {
                        this._cacheInstance(registration, instance, injectionArgs, config);
                    }
                    return instance;
                };
                Container.prototype._getNewInstanceAsync = function (registration, resolutionContext, injectionArgs, config) {
                    if (injectionArgs === void 0) { injectionArgs = []; }
                    return __awaiter(this, void 0, void 0, function () {
                        var configUsed, dependencies, instance;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    configUsed = this._mergeRegistrationConfig(registration, config);
                                    this._validateResolutionContext(registration, resolutionContext);
                                    dependencies = this._resolveDependencies(registration, resolutionContext);
                                    return [4 /*yield*/, this._createType(registration, dependencies, injectionArgs)];
                                case 1:
                                    instance = _a.sent();
                                    this._configureInstance(instance, registration, configUsed);
                                    if (!resolutionContext.isDependencyOwned) {
                                        this._cacheInstance(registration, instance, injectionArgs, config);
                                    }
                                    return [2 /*return*/, instance];
                            }
                        });
                    });
                };
                Container.prototype._validateResolutionContext = function (registration, resolutionContext) {
                    var historyIndex = resolutionContext.history.indexOf(registration);
                    if (historyIndex === 0) {
                        return;
                    }
                };
                Container.prototype._resolveDependencies = function (registration, resolutionContext) {
                    var _this = this;
                    var resolvedDependencies = [];
                    resolutionContext.history.push(registration);
                    var dependencies = registration.settings.dependencies || [];
                    dependencies.forEach(function (dependency) {
                        var resolvedDependency = _this._resolveDependency(registration, dependency, resolutionContext);
                        resolvedDependencies.push(resolvedDependency);
                    });
                    return resolvedDependencies;
                };
                Container.prototype._resolveDependenciesAsync = function (registration, resolutionContext) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _this = this;
                        var resolvedDependencies, dependencies;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    resolvedDependencies = [];
                                    resolutionContext.history.push(registration);
                                    dependencies = registration.settings.dependencies || [];
                                    return [4 /*yield*/, Promise.all(dependencies.map(function (dependency) { return __awaiter(_this, void 0, void 0, function () {
                                            var resolvedDependency;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, this._resolveDependencyAsync(registration, dependency, resolutionContext)];
                                                    case 1:
                                                        resolvedDependency = _a.sent();
                                                        resolvedDependencies.push(resolvedDependency);
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); }))];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                Container.prototype._resolveDependency = function (registration, dependencyKey, resolutionContext) {
                    var newResolutionContext = this._createChildResolutionContext(registration, resolutionContext);
                    var overwrittenDependencyKey = this._getDependencyKeyOverwritten(registration, dependencyKey);
                    var dependencyRegistration = _super.prototype.getRegistration.call(this, overwrittenDependencyKey);
                    newResolutionContext.isDependencyOwned = this._isDependencyOwned(registration, overwrittenDependencyKey);
                    if (this._isDependencyLazy(registration, overwrittenDependencyKey)) {
                        return this._resolveLazy(dependencyRegistration, newResolutionContext, undefined, undefined);
                    }
                    if (this._isDependencyLazyAsync(registration, overwrittenDependencyKey)) {
                        return this._resolveLazyAsync(dependencyRegistration, newResolutionContext, undefined, undefined);
                    }
                    if (dependencyRegistration.settings.isObject) {
                        return this._resolveObject(dependencyRegistration, resolutionContext, undefined, undefined);
                    }
                    if (dependencyRegistration.settings.isFactory) {
                        return this._resolveFactory(dependencyRegistration, resolutionContext, undefined, undefined);
                    }
                    return this._resolveInstance(dependencyRegistration, newResolutionContext, undefined, undefined);
                };
                Container.prototype._resolveDependencyAsync = function (registration, dependencyKey, resolutionContext) {
                    return __awaiter(this, void 0, void 0, function () {
                        var newResolutionContext, dependencyRegistration;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    newResolutionContext = this._createChildResolutionContext(registration, resolutionContext);
                                    dependencyRegistration = _super.prototype.getRegistration.call(this, dependencyKey);
                                    if (this._isDependencyLazy(registration, dependencyKey)) {
                                        return [2 /*return*/, this._resolveLazy(dependencyRegistration, newResolutionContext, undefined, undefined)];
                                    }
                                    if (this._isDependencyLazyAsync(registration, dependencyKey)) {
                                        return [2 /*return*/, this._resolveLazyAsync(dependencyRegistration, newResolutionContext, undefined, undefined)];
                                    }
                                    if (dependencyRegistration.settings.isObject) {
                                        return [2 /*return*/, this._resolveObjectAsync(dependencyRegistration, resolutionContext, undefined, undefined)];
                                    }
                                    if (dependencyRegistration.settings.isFactory) {
                                        return [2 /*return*/, this._resolveFactoryAsync(dependencyRegistration, resolutionContext, undefined, undefined)];
                                    }
                                    return [4 /*yield*/, this._resolveInstanceAsync(dependencyRegistration, newResolutionContext, undefined, undefined)];
                                case 1: return [2 /*return*/, _a.sent()];
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
                                    return [4 /*yield*/, resolver.resolveObjectAsync(this, registration)];
                                case 1:
                                    object = _a.sent();
                                    createdObject = resolver.createObject(this, object, registration, dependencies, injectionArgs);
                                    return [2 /*return*/, createdObject];
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
                                    return [4 /*yield*/, resolver.resolveFactoryAsync(this, registration)];
                                case 1:
                                    type = _a.sent();
                                    factory = resolver.createFactory(this, type, registration, dependencies, injectionArgs);
                                    return [2 /*return*/, factory];
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
                                    return [4 /*yield*/, resolver.resolveTypeAsync(this, registration)];
                                case 1:
                                    type = _a.sent();
                                    instance = resolver.createInstance(this, type, registration, dependencies, injectionArgs);
                                    return [2 /*return*/, instance];
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
                        this.instances = new Map();
                    }
                    var allInstances = this.instances.get(key);
                    if (!allInstances) {
                        return [];
                    }
                    var configHash = resolver.hashConfig(config);
                    var configInstances = allInstances.get(configHash);
                    if (!configInstances) {
                        return [];
                    }
                    var injectionArgsHash = resolver.hash(injectionArgs);
                    var argumentInstances = configInstances.get(injectionArgsHash);
                    if (!argumentInstances) {
                        return [];
                    }
                    return argumentInstances;
                };
                Container.prototype._cacheInstance = function (registration, instance, injectionArgs, config) {
                    var key = registration.settings.key;
                    var resolver = this._getResolver(registration);
                    if (!this.instances) {
                        this.instances = new Map();
                    }
                    var allInstances = this.instances.get(key);
                    if (!allInstances) {
                        allInstances = new Map();
                        this.instances.set(key, allInstances);
                    }
                    var configHash = resolver.hashConfig(config);
                    var configInstances = allInstances.get(configHash);
                    if (!configInstances) {
                        configInstances = new Map();
                        allInstances.set(configHash, configInstances);
                    }
                    var injectionArgsHash = resolver.hash(injectionArgs);
                    var argumentInstances = configInstances.get(injectionArgsHash);
                    if (!argumentInstances) {
                        argumentInstances = [];
                        configInstances.set(injectionArgsHash, argumentInstances);
                    }
                    argumentInstances.push(instance);
                };
                Container.prototype.validateDependencies = function () {
                    var keys = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        keys[_i] = arguments[_i];
                    }
                    var validationKeys = keys.length > 0 ? keys : this.getRegistrationKeys();
                    var errors = this._validateDependencies(validationKeys);
                    if (errors.length > 0) {
                        console.log('------------------');
                        console.log(errors);
                        console.log('------------------');
                        throw new Error('fuck');
                    }
                    return errors;
                };
                Container.prototype._validateDependencies = function (keys, history) {
                    var _this = this;
                    if (history === void 0) { history = []; }
                    var errors = [];
                    keys.forEach(function (key) {
                        var registration = _this.getRegistration(key);
                        if (history.indexOf(registration) > 0) {
                            var errorMessage = "circular dependency on key '" + registration.settings.key + "' detected.";
                            var validationError = _this._createValidationError(registration, history, errorMessage);
                            errors.push(validationError);
                            return;
                        }
                        history.push(registration);
                        if (!registration.settings.dependencies) {
                            return;
                        }
                        for (var _i = 0, _a = registration.settings.dependencies; _i < _a.length; _i++) {
                            var dependencyKey = _a[_i];
                            var dependency = _this.getRegistration(dependencyKey);
                            var deepErrors = _this._validateDependency(registration, dependency, history);
                            Array.prototype.push.apply(errors, deepErrors);
                        }
                    });
                    return errors;
                };
                Container.prototype._validateDependency = function (registration, dependency, history) {
                    var newRegistrationHistory = [];
                    Array.prototype.push.apply(newRegistrationHistory, history);
                    var errors = [];
                    var dependencyKey = dependency.settings.key;
                    var dependencyKeyOverwritten = this._getDependencyKeyOverwritten(registration, dependency.settings.key);
                    if (!dependency) {
                        var errorMessage = void 0;
                        if (dependencyKey === dependencyKeyOverwritten) {
                            errorMessage = "dependency '" + dependencyKey + "' overwritten with key '" + dependencyKeyOverwritten + "' declared on '" + registration.settings.key + "' is missing.";
                        }
                        else {
                            errorMessage = "dependency '" + dependencyKeyOverwritten + "' declared on '" + registration.settings.key + "' is missing.";
                        }
                        var validationError = this._createValidationError(registration, newRegistrationHistory, errorMessage);
                        errors.push(validationError);
                    }
                    else if (dependency.settings.dependencies) {
                        var overwrittenKeyValidationErrors = this._validateOverwrittenKeys(registration, newRegistrationHistory);
                        Array.prototype.push.apply(errors, overwrittenKeyValidationErrors);
                        var circularBreakFound = this._historyHasCircularBreak(newRegistrationHistory, dependency);
                        if (!circularBreakFound) {
                            var deepErrors = this._validateDependencies([dependency.settings.key], newRegistrationHistory);
                            Array.prototype.push.apply(errors, deepErrors);
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
                        if (_this.settings.circularDependencyCanIncludeLazy && parentSettings.lazyDependencies && parentSettings.lazyDependencies.length > 0) {
                            if (parentSettings.lazyDependencies.length === 0 ||
                                parentSettings.lazyDependencies.indexOf(dependency.settings.key) >= 0) {
                                return true;
                            }
                        }
                    });
                };
                Container.prototype._createValidationError = function (registration, history, errorMessage) {
                    var validationError = {
                        registrationStack: history,
                        currentRegistration: registration,
                        errorMessage: errorMessage
                    };
                    return validationError;
                };
                Container.prototype._validateOverwrittenKeys = function (registration, history) {
                    var _this = this;
                    var overwrittenKeys = Object.keys(registration.settings.overwrittenKeys);
                    var errors = [];
                    overwrittenKeys.forEach(function (overwrittenKey) {
                        var keyErrors = _this._validateOverwrittenKey(registration, overwrittenKey, history);
                        Array.prototype.push.apply(errors, keyErrors);
                    });
                    return errors;
                };
                Container.prototype._validateOverwrittenKey = function (registration, overwrittenKey, history) {
                    var errors = [];
                    if (registration.settings.dependencies.indexOf(overwrittenKey) < 0) {
                        var errorMessage = "No dependency for overwritten key '" + overwrittenKey + "' has been declared on registration for key '" + registration.settings.key + "'.";
                        var validationError = this._createValidationError(registration, history, errorMessage);
                        errors.push(validationError);
                    }
                    var overwrittenKeyValue = registration.settings.overwrittenKeys[overwrittenKey];
                    var overwrittenKeyRegistration = this.getRegistration(overwrittenKeyValue);
                    if (!overwrittenKeyRegistration) {
                        var errorMessage = "Registration for overwritten key '" + overwrittenKey + "' declared on registration for key '" + registration.settings.key + "' is missing.";
                        var validationError = this._createValidationError(registration, history, errorMessage);
                        errors.push(validationError);
                    }
                    return errors;
                };
                Container.prototype._createNewResolutionContext = function (registration) {
                    return new resolution_context_1.ResolutionContext(registration);
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
                    var ownedDependencies = registration.settings.ownedDependencies || [];
                    ownedDependencies.forEach(function (ownedDependency) {
                        newResolutionContext.owners[ownedDependency] = registration;
                    });
                    return newResolutionContext;
                };
                Container.prototype._cloneResolutionContext = function (resolutionContext) {
                    return Object.assign({}, resolutionContext);
                };
                Container.prototype._isDependencyLazy = function (registration, dependencyKey) {
                    if (!registration.settings.lazyDependencies) {
                        return false;
                    }
                    return registration.settings.lazyDependencies && registration.settings.lazyDependencies.length !== 0 && registration.settings.lazyDependencies.indexOf(dependencyKey) >= 0;
                };
                Container.prototype._isDependencyLazyAsync = function (registration, dependencyKey) {
                    if (!registration.settings.lazyPromiseDependencies) {
                        return false;
                    }
                    return registration.settings.lazyPromiseDependencies && registration.settings.lazyPromiseDependencies.length !== 0 && registration.settings.lazyPromiseDependencies.indexOf(dependencyKey) >= 0;
                };
                Container.prototype._isDependencyOwned = function (registration, dependencyKey) {
                    if (!registration.settings.ownedDependencies) {
                        return false;
                    }
                    return registration.settings.ownedDependencies.length === 0 || registration.settings.ownedDependencies.indexOf(dependencyKey) >= 0;
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
            exports_1("Container", Container);
        }
    };
});

//# sourceMappingURL=container.js.map
