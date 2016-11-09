System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var DependencyInjectionContainer, TypeRegistration, TypeRegistrationSettings;
    return {
        setters:[],
        execute: function() {
            DependencyInjectionContainer = (function () {
                function DependencyInjectionContainer(config) {
                    this._config = undefined;
                    this._registrations = {};
                    this._instances = {};
                    this._externalConfigProvider = undefined;
                    this._config = config;
                    this._initializeRegistrationDeclarations();
                    this._initializeBaseRegistrations();
                }
                DependencyInjectionContainer.prototype.clear = function () {
                    this._registrations = {};
                    this._instances = {};
                    this._initializeBaseRegistrations();
                };
                Object.defineProperty(DependencyInjectionContainer.prototype, "config", {
                    get: function () {
                        return this._config;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DependencyInjectionContainer.prototype, "registrations", {
                    get: function () {
                        return this._registrations;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DependencyInjectionContainer.prototype, "instances", {
                    get: function () {
                        return this._instances;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DependencyInjectionContainer.prototype, "externalConfigProvider", {
                    get: function () {
                        return this._externalConfigProvider;
                    },
                    enumerable: true,
                    configurable: true
                });
                DependencyInjectionContainer.prototype.setConfigProvider = function (configProvider) {
                    if (typeof configProvider === 'function' && configProvider !== null) {
                        this._externalConfigProvider = configProvider;
                    }
                    else {
                        throw new Error('Config provider must be a function.');
                    }
                };
                DependencyInjectionContainer.prototype.setDefaults = function (registrationDefaults) {
                    var _this = this;
                    if (registrationDefaults) {
                        var defaultSettings = [
                            'isSingleton',
                            'wantsInjection',
                            'isLazy',
                            'bindFunctions',
                            'autoCreateMissingSubscribers'
                        ];
                        defaultSettings.forEach(function (defaultSetting) {
                            var defaultSettingValue = registrationDefaults[defaultSetting];
                            _this._setDefault(defaultSetting, defaultSettingValue);
                        });
                    }
                };
                DependencyInjectionContainer.prototype._setDefault = function (settingKey, value) {
                    if (this._isValidBoolean(value)) {
                        this.config.registrationDefaults[settingKey] = value;
                        return true;
                    }
                    return false;
                };
                DependencyInjectionContainer.prototype._isValidBoolean = function (settingValue) {
                    return typeof settingValue === 'boolean';
                };
                DependencyInjectionContainer.prototype.register = function (key, type) {
                    var keyType = typeof key;
                    var currentRegistration;
                    if (keyType === 'string') {
                        currentRegistration = this._registerTypeByKey(key, type);
                    }
                    else {
                        throw new Error("The key type '" + key + "' is not supported.");
                    }
                    this.registrations[key] = currentRegistration;
                    return currentRegistration;
                };
                DependencyInjectionContainer.prototype.unregister = function (key) {
                    if (this.registrations[key]) {
                        delete this.registrations[key];
                    }
                    else {
                        throw new Error("The key '" + key + "' is not registered.");
                    }
                };
                DependencyInjectionContainer.prototype._registerTypeByKey = function (key, type) {
                    if (!key) {
                        throw new Error("No key specified for registration of type '" + type + "'");
                    }
                    if (!type) {
                        throw new Error("No type specified for registration of key '" + key + "'");
                    }
                    return new TypeRegistration(this.config.registrationDefaults, key, type);
                };
                DependencyInjectionContainer.prototype.registerFactory = function (key, factoryMethod) {
                    if (typeof key !== 'string') {
                        throw new Error("No key specified for registration of factory function '" + factoryMethod + "'");
                    }
                    var currentRegistration = new TypeRegistration(this.config.registrationDefaults, key, factoryMethod, true);
                    this.registrations[key] = currentRegistration;
                    return currentRegistration;
                };
                DependencyInjectionContainer.prototype.registerObject = function (key, object) {
                    var keyType = typeof key;
                    var currentRegistration;
                    if (keyType === 'string') {
                        if (!key) {
                            throw new Error("No key specified for registration of type '" + keyType + "'");
                        }
                        currentRegistration = new TypeRegistration(this.config.registrationDefaults, key, object);
                    }
                    else {
                        throw new Error("The key type '" + key + "' is not supported.");
                    }
                    this.registrations[key] = currentRegistration;
                    currentRegistration.settings.isObject = true;
                    return currentRegistration;
                };
                DependencyInjectionContainer.prototype._initializeBaseRegistrations = function () {
                    this.registerObject(this.config.injectContainerKey, this);
                };
                DependencyInjectionContainer.prototype._initializeRegistrationDeclarations = function () {
                    var _this = this;
                    var declarations = [
                        'dependencies',
                        'configure',
                        'singleton',
                        'noInjection',
                        'injectInto',
                        'injectLazy',
                        'onNewInstance',
                        'bindFunctions'
                    ];
                    declarations.forEach(function (declaration) {
                        _this[declaration] = function () {
                            _this._ensureRegistrationStarted(declaration);
                        };
                    });
                };
                DependencyInjectionContainer.prototype._ensureRegistrationStarted = function (declaration) {
                    throw new Error("There is no registration present to use '" + declaration + "'.\n        You can start a registration by calling the 'register' method.");
                };
                DependencyInjectionContainer.prototype._getRegistration = function (key) {
                    var registration = this.registrations[key];
                    if (registration) {
                        return registration;
                    }
                    throw new Error("There is no registration created for key '" + key + "'.");
                };
                DependencyInjectionContainer.prototype.resolve = function (key, injectionArgs, config) {
                    return this._resolve(key, injectionArgs, config);
                };
                DependencyInjectionContainer.prototype._resolve = function (key, injectionArgs, config, resolvedKeyHistory, isLazy) {
                    if (typeof injectionArgs !== 'undefined' && !Array.isArray(injectionArgs)) {
                        throw new Error("Injection args must be of type 'Array'.");
                    }
                    var registration = this._getRegistration(key);
                    if (registration.settings.isObject) {
                        if (isLazy) {
                            return function () {
                                return registration.settings.type;
                            };
                        }
                        return registration.settings.type;
                    }
                    return this._resolveInstance(registration, injectionArgs, config, resolvedKeyHistory, isLazy);
                };
                DependencyInjectionContainer.prototype._resolveInstance = function (registration, injectionArgs, config, resolvedKeyHistory, isLazy) {
                    var _this = this;
                    if (Array.isArray(resolvedKeyHistory) && resolvedKeyHistory.indexOf(registration.settings.key) >= 0) {
                        throw new Error("Circular dependency on key '" + registration.settings.key + "' detected.");
                    }
                    var resolvedRegistrationConfig = this._getConfig(registration.settings.key);
                    var resolvedRuntimeConfig = this._resolveConfig(registration.settings.key, config);
                    var configUsed = this._mergeConfig(resolvedRegistrationConfig, resolvedRuntimeConfig);
                    if (registration.settings.isSingleton) {
                        return this._getInstance(registration, injectionArgs, configUsed);
                    }
                    if (isLazy) {
                        return function (lazyInjectionArgs, lazyConfig) {
                            var injectionArgsUsed = _this._mergeArguments(injectionArgs, lazyInjectionArgs);
                            var lazyConfigUsed = _this._mergeConfig(configUsed, lazyConfig);
                            return _this._getNewInstance(registration, injectionArgsUsed, lazyConfigUsed, resolvedKeyHistory);
                        };
                    }
                    return this._getNewInstance(registration, injectionArgs, configUsed, resolvedKeyHistory);
                };
                DependencyInjectionContainer.prototype._mergeArguments = function (baseArgs, additionalArgs) {
                    if (additionalArgs && !Array.isArray(additionalArgs)) {
                        throw new Error('Arguments have to be of type Array');
                    }
                    if (!baseArgs) {
                        return additionalArgs;
                    }
                    var argsUsed = baseArgs || undefined;
                    if (!Array.isArray(argsUsed)) {
                        throw new Error('Arguments have to be of type Array');
                    }
                    var finalArgs = Array.prototype.push.apply(argsUsed, additionalArgs);
                    return finalArgs;
                };
                DependencyInjectionContainer.prototype._mergeConfig = function (baseConfig, additionalConfig) {
                    var configUsed = baseConfig || undefined;
                    if (!configUsed) {
                        return additionalConfig;
                    }
                    var finalConfig = Object.assign(configUsed, additionalConfig);
                    return finalConfig;
                };
                DependencyInjectionContainer.prototype._getInstance = function (registration, injectionArgs, config) {
                    var instances = this.instances[registration.settings.key];
                    var instance = null;
                    if (typeof instances === 'undefined') {
                        return this._getNewInstance(registration, injectionArgs, config);
                    }
                    instances = this.instances[registration.settings.key][config][injectionArgs];
                    if (Array.isArray(instances)) {
                        if (instances.length === 0) {
                            return this._getNewInstance(registration, injectionArgs, config);
                        }
                        else {
                            instance = instances[0];
                        }
                    }
                    return instance;
                };
                DependencyInjectionContainer.prototype._getKeysForInstanceConfigurationsByKey = function (key) {
                    var instance = this.instances[key];
                    if (!instance) {
                        return null;
                    }
                    return Object.keys(instance);
                };
                DependencyInjectionContainer.prototype._getKeysForInstanceInjectionArgumentsByKeyAndConfig = function (key, config) {
                    var instance = this.instances[key][config];
                    if (!instance) {
                        return null;
                    }
                    return Object.keys(instance);
                };
                DependencyInjectionContainer.prototype._getAllInstances = function (key, config, injectionArgs) {
                    var _this = this;
                    var configKeys = [];
                    if (config) {
                        configKeys.push(config);
                    }
                    else {
                        Array.prototype.push.apply(configKeys, this._getKeysForInstanceConfigurationsByKey(key));
                    }
                    if (configKeys.length === 0) {
                        return null;
                    }
                    var allInstances = [];
                    configKeys.forEach(function (configKey) {
                        var instanceInjectionArgumentKeys = _this._getKeysForInstanceInjectionArgumentsByKeyAndConfig(key, config);
                        if (!instanceInjectionArgumentKeys) {
                            return;
                        }
                        instanceInjectionArgumentKeys.forEach(function (instanceInjectionArgumentKey) {
                            Array.prototype.push.apply(allInstances, _this.instances[key][configKey][instanceInjectionArgumentKey]);
                        });
                    });
                    return allInstances;
                };
                DependencyInjectionContainer.prototype._getNewInstance = function (registration, injectionArgs, config, resolvedKeyHistory) {
                    var dependencies = this._resolveDependencies(registration, resolvedKeyHistory);
                    var instance = this._createInstance(registration, dependencies, injectionArgs);
                    this._configureInstance(instance, config);
                    this._callSubscribers(registration, 'newInstance', instance);
                    this._bindFunctionsToInstance(registration, instance);
                    this._cacheInstance(registration.settings.key, instance, injectionArgs, config);
                    return instance;
                };
                DependencyInjectionContainer.prototype._bindFunctionsToInstance = function (registration, instance) {
                    if (!registration.settings.bindFunctions) {
                        return;
                    }
                    var instanceKeys;
                    if (registration.settings.functionsToBind.length > 0) {
                        instanceKeys = registration.settings.functionsToBind;
                    }
                    else {
                        var instancePrototype = Object.getPrototypeOf(instance);
                        instanceKeys = Object.getOwnPropertyNames(instancePrototype);
                    }
                    instanceKeys.forEach(function (instanceKey) {
                        if (instanceKey === 'constructor') {
                            return;
                        }
                        var keyType = typeof instance[instanceKey];
                        if (keyType === 'function') {
                            var unboundKey = instance[instanceKey];
                            instance[instanceKey] = unboundKey.bind(instance);
                        }
                    });
                };
                DependencyInjectionContainer.prototype.resolveDependencies = function (key) {
                    var registration = this._getRegistration(key);
                    return this._resolveDependencies(registration);
                };
                DependencyInjectionContainer.prototype._resolveDependencies = function (registration, resolvedKeyHistory) {
                    var _this = this;
                    var resolvedDependencies = [];
                    var configuredDependencies = registration.settings.dependencies;
                    if (!configuredDependencies) {
                        return resolvedDependencies;
                    }
                    var dependencies;
                    var dependenciesType = typeof configuredDependencies;
                    if (Array.isArray(registration.settings.dependencies)) {
                        dependencies = configuredDependencies;
                    }
                    else if (dependenciesType === 'string') {
                        dependencies = [configuredDependencies];
                    }
                    else {
                        throw new Error("The type '" + dependenciesType + "' of your dependencies declaration is not yet supported.\n        Supported types: 'Array', 'String'");
                    }
                    if (!resolvedKeyHistory) {
                        resolvedKeyHistory = [];
                    }
                    resolvedKeyHistory.push(registration.settings.key);
                    dependencies.forEach(function (dependency) {
                        var isLazy = _this._isDependencyLazy(registration, dependency);
                        var dependencyKey = _this._getDependencyKeyOverwritten(registration, dependency);
                        var dependencyInstance = _this._resolve(dependencyKey, undefined, undefined, resolvedKeyHistory, isLazy);
                        resolvedDependencies.push(dependencyInstance);
                    });
                    return resolvedDependencies;
                };
                DependencyInjectionContainer.prototype._isDependencyLazy = function (registration, dependency) {
                    var isLazy = registration.settings.isLazy && (registration.settings.lazyKeys.length === 0 || registration.settings.lazyKeys.indexOf(dependency) >= 0);
                    return isLazy;
                };
                DependencyInjectionContainer.prototype._getDependencyKeyOverwritten = function (registration, dependency) {
                    var dependencyKey = dependency;
                    if (registration.settings.overwrittenKeys[dependency]) {
                        dependencyKey = registration.settings.overwrittenKeys[dependency];
                    }
                    return dependencyKey;
                };
                DependencyInjectionContainer.prototype._createInstance = function (registration, dependencies, injectionArgs) {
                    var instance;
                    var type = registration.settings.type;
                    var argumentsToBeInjected = dependencies.concat(injectionArgs);
                    if (typeof type !== 'function') {
                        instance = type;
                        if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
                            this._injectDependenciesIntoInstance(registration, instance, argumentsToBeInjected);
                        }
                    }
                    else if (registration.settings.wantsInjection && !registration.settings.injectInto && argumentsToBeInjected.length > 0) {
                        if (registration.settings.isFactory) {
                            instance = this._createInstanceByFactoryWithInjection(type, argumentsToBeInjected);
                        }
                        else {
                            instance = this._createInstanceByConstructorWithInjection(type, argumentsToBeInjected);
                        }
                    }
                    else {
                        if (registration.settings.isFactory) {
                            instance = this._createInstanceByFactory(type);
                        }
                        else {
                            instance = this._createInstanceByConstructor(type);
                        }
                        if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
                            this._injectDependenciesIntoInstance(registration, instance, argumentsToBeInjected);
                        }
                    }
                    return instance;
                };
                DependencyInjectionContainer.prototype._createInstanceByFactory = function (type) {
                    var instance = type();
                    return instance;
                };
                DependencyInjectionContainer.prototype._createInstanceByFactoryWithInjection = function (type, argumentsToBeInjected) {
                    var instance = type.apply(undefined, argumentsToBeInjected);
                    return instance;
                };
                DependencyInjectionContainer.prototype._createInstanceByConstructor = function (type) {
                    var instance = new type();
                    return instance;
                };
                DependencyInjectionContainer.prototype._createInstanceByConstructorWithInjection = function (type, argumentsToBeInjected) {
                    var instance = new (Function.prototype.bind.apply(type, [null].concat(argumentsToBeInjected)))();
                    return instance;
                };
                DependencyInjectionContainer.prototype._injectDependenciesIntoInstance = function (registration, instance, argumentsToBeInjected) {
                    var propertySource;
                    if (registration.settings.isFactory) {
                        propertySource = instance;
                    }
                    else {
                        propertySource = Object.getPrototypeOf(instance);
                    }
                    var injectionTargetPropertyDescriptor = this._getPropertyDescriptor(propertySource, registration.settings.injectInto);
                    if (injectionTargetPropertyDescriptor) {
                        if (typeof injectionTargetPropertyDescriptor.value === 'function') {
                            this._injectDependenciesIntoFunction(instance, injectionTargetPropertyDescriptor.value, argumentsToBeInjected);
                        }
                        else if (injectionTargetPropertyDescriptor.set) {
                            this._injectDependenciesIntoProperty(instance, registration.settings.injectInto, argumentsToBeInjected);
                        }
                        else {
                            throw new Error("The setter for the '" + registration.settings.injectInto + "' property on type '" + Object.getPrototypeOf(instance).constructor.name + "' is missing.");
                        }
                    }
                    else {
                        throw new Error("The injection target '" + registration.settings.injectInto + "' on type '" + Object.getPrototypeOf(instance).constructor.name + "' is missing.");
                    }
                };
                DependencyInjectionContainer.prototype._getPropertyDescriptor = function (type, key) {
                    var propertyDescriptor = Object.getOwnPropertyDescriptor(type, key);
                    if (propertyDescriptor) {
                        return propertyDescriptor;
                    }
                    var prototype = Object.getPrototypeOf(type);
                    if (!prototype) {
                        return undefined;
                    }
                    return this._getPropertyDescriptor(prototype, key);
                };
                DependencyInjectionContainer.prototype._injectDependenciesIntoFunction = function (instance, targetFunction, argumentsToBeInjected) {
                    targetFunction.apply(targetFunction, argumentsToBeInjected);
                };
                DependencyInjectionContainer.prototype._injectDependenciesIntoProperty = function (instance, property, argumentsToBeInjected) {
                    instance[property] = argumentsToBeInjected;
                };
                DependencyInjectionContainer.prototype._getSubscriberRegistrations = function (key, subscriptionKey) {
                    var _this = this;
                    var subscribers = [];
                    var registrationKeys = Object.keys(this.registrations);
                    registrationKeys.forEach(function (registrationKey) {
                        var registration = _this.registrations[registrationKey];
                        registration.settings.subscriptions[subscriptionKey].some(function (subscription) {
                            if (subscription.key === key || subscription.key === '*') {
                                subscribers.push(registration);
                                return true;
                            }
                        });
                    });
                    return subscribers;
                };
                DependencyInjectionContainer.prototype._getSubscriptionFromRegistrationByKey = function (registration, subscriptionKey, key) {
                    var resultSubscription = null;
                    registration.settings.subscriptions[subscriptionKey].some(function (subscription) {
                        if (subscription.key === key) {
                            resultSubscription = subscription;
                            return true;
                        }
                    });
                    return resultSubscription;
                };
                DependencyInjectionContainer.prototype._callSubscribers = function (registration, subscriptionKey, params) {
                    var _this = this;
                    var subscriberRegistrations = this._getSubscriberRegistrations(registration.settings.key, subscriptionKey);
                    subscriberRegistrations.forEach(function (subscriberRegistration) {
                        var subscribedInstances = _this._getAllInstances(subscriberRegistration.settings.key);
                        if (subscribedInstances === null) {
                            var newInstance = _this._createMissingSubscriber(subscriberRegistration);
                            subscribedInstances = [newInstance];
                        }
                        subscribedInstances.forEach(function (subscribedInstance) {
                            _this._callSubscriber(registration, subscriptionKey, subscriberRegistration, subscribedInstance, params);
                        });
                    });
                };
                DependencyInjectionContainer.prototype._createMissingSubscriber = function (subscriberRegistration) {
                    if (subscriberRegistration.settings.autoCreateMissingSubscribers) {
                        return this._getNewInstance(subscriberRegistration);
                    }
                    throw new Error("There is no instance created for key '" + subscriberRegistration.settings.key + "'.");
                };
                DependencyInjectionContainer.prototype._callSubscriber = function (subscribedRegistration, subscriptionKey, subscriberRegistration, subscribedInstance, params) {
                    if (!Array.isArray(params)) {
                        params = [params];
                    }
                    var methodSubscription = this._getSubscriptionFromRegistrationByKey(subscriberRegistration, subscriptionKey, subscribedRegistration.settings.key);
                    var subscribedMethod = subscribedInstance[methodSubscription.method];
                    subscribedMethod.apply(subscribedInstance, params);
                };
                DependencyInjectionContainer.prototype._configureInstance = function (instance, config) {
                    if (!config) {
                        return;
                    }
                    var configPropertyDescriptor = this._getPropertyDescriptor(instance, 'config');
                    if (configPropertyDescriptor === undefined || !configPropertyDescriptor.set) {
                        var instancePrototype = Object.getPrototypeOf(instance);
                        throw new Error("The setter for the config property on type '" + instancePrototype.constructor.name + "' is missing.");
                    }
                    instance.config = config;
                };
                DependencyInjectionContainer.prototype._cacheInstance = function (key, instance, injectionArgs, config) {
                    if (!this.instances[key]) {
                        this.instances[key] = {};
                    }
                    if (!this.instances[key][config]) {
                        this.instances[key][config] = {};
                    }
                    if (!this.instances[key][config][injectionArgs]) {
                        this.instances[key][config][injectionArgs] = [];
                    }
                    this.instances[key][config][injectionArgs].push(instance);
                };
                DependencyInjectionContainer.prototype._getConfig = function (key) {
                    var config = this.registrations[key].settings.config;
                    var resolvedConfig = this._resolveConfig(key, config);
                    if (!resolvedConfig) {
                        return undefined;
                    }
                    return resolvedConfig;
                };
                DependencyInjectionContainer.prototype._resolveConfig = function (key, config) {
                    var registration = this.registrations[key];
                    var resolvedConfig;
                    var configType = typeof config;
                    if (configType === 'function') {
                        resolvedConfig = config(key);
                        if (!resolvedConfig) {
                            throw new Error("The specified config function for registration key " + registration.settings.key + " returned undefined.");
                        }
                    }
                    else if (configType === 'object') {
                        resolvedConfig = config;
                        if (!resolvedConfig) {
                            throw new Error("The specified config for registration key " + registration.settings.key + " is undefined.");
                        }
                    }
                    else if (configType === 'string') {
                        if (typeof this.externalConfigProvider !== 'function' || this.externalConfigProvider === null) {
                            throw new Error("The specified config for registration key " + registration.settings.key + " is null.");
                        }
                        resolvedConfig = this.externalConfigProvider(config, registration);
                        if (!resolvedConfig) {
                            throw new Error("The specified config for registration key " + registration.settings.key + " is null.");
                        }
                    }
                    else {
                        resolvedConfig = undefined;
                    }
                    return resolvedConfig;
                };
                DependencyInjectionContainer.prototype.validateDependencies = function (key) {
                    var registrationKeys;
                    if (Array.isArray(key)) {
                        registrationKeys = key;
                    }
                    else if (typeof key !== 'undefined') {
                        registrationKeys = [key];
                    }
                    else {
                        registrationKeys = Object.keys(this.registrations);
                    }
                    var errors = this._validateDependencies(registrationKeys);
                    if (errors.length > 0) {
                        throw new Error("Errors during validation of dependencies:\n          " + errors.toString());
                    }
                };
                DependencyInjectionContainer.prototype._validateDependencies = function (registrationKeys, parentRegistrationHistory) {
                    var _this = this;
                    var errors = [];
                    registrationKeys.forEach(function (registrationKey) {
                        var registration = _this.registrations[registrationKey];
                        var dependencies = registration.settings.dependencies;
                        if (!parentRegistrationHistory) {
                            parentRegistrationHistory = [];
                        }
                        else if (parentRegistrationHistory.indexOf(registration) >= 0) {
                            errors.push("Circular dependency on key '" + registrationKey + "' detected.");
                            return;
                        }
                        var subParentRegistrationHistory = [];
                        Array.prototype.push.apply(subParentRegistrationHistory, parentRegistrationHistory);
                        subParentRegistrationHistory.push(registration);
                        if (!dependencies) {
                            return;
                        }
                        for (var dependencyIndex = 0; dependencyIndex < dependencies.length; dependencyIndex++) {
                            var originalDependencyKey = dependencies[dependencyIndex];
                            var originalDependencyKeyRegistration = _this.registrations[originalDependencyKey];
                            var dependencyKeyOverwritten = _this._getDependencyKeyOverwritten(registration, originalDependencyKey);
                            if (!originalDependencyKeyRegistration) {
                                errors.push("Registration for '" + originalDependencyKey + "' overwritten with '" + dependencyKeyOverwritten + "' declared on registered for key '" + registration.settings.key + "' is missing.");
                            }
                            var dependencyRegistration = _this.registrations[dependencyKeyOverwritten];
                            if (!dependencyRegistration) {
                                if (originalDependencyKey !== dependencyKeyOverwritten) {
                                    errors.push("Dependency '" + originalDependencyKey + "' overwritten with key '" + dependencyKeyOverwritten + "' declared on '" + registration.settings.key + "' is missing.");
                                }
                                else {
                                    errors.push("Dependency '" + dependencyKeyOverwritten + "' declared on '" + registration.settings.key + "' is missing.");
                                }
                            }
                            else if (dependencyRegistration.settings.dependencies) {
                                var overwrittenKeyValidationErrors = _this._validateOverwrittenKeys(registration);
                                Array.prototype.push.apply(errors, overwrittenKeyValidationErrors);
                                var circularBreakFound = _this._historyHasCircularBreak(subParentRegistrationHistory, dependencyRegistration);
                                if (!circularBreakFound) {
                                    var deepErrors = _this._validateDependencies([dependencyRegistration.settings.key], subParentRegistrationHistory);
                                    if (deepErrors.length > 0) {
                                        errors.push("Inner dependency errors for dependency '" + dependencyKeyOverwritten + "':\n                  " + deepErrors.toString());
                                    }
                                }
                            }
                        }
                    });
                    return errors;
                };
                DependencyInjectionContainer.prototype._historyHasCircularBreak = function (parentRegistrationHistory, dependencyRegistration) {
                    var _this = this;
                    return parentRegistrationHistory.some(function (parentRegistration) {
                        var parentSettings = parentRegistration.settings;
                        if (_this.config.circularDependencyCanIncludeSingleton && parentSettings.isSingleton) {
                            return true;
                        }
                        if (_this.config.circularDependencyCanIncludeLazy && parentSettings.isLazy) {
                            if (parentSettings.lazyKeys.length === 0 ||
                                parentSettings.lazyKeys.indexOf(dependencyRegistration.settings.key) >= 0) {
                                return true;
                            }
                        }
                    });
                };
                DependencyInjectionContainer.prototype._validateOverwrittenKeys = function (registration) {
                    var _this = this;
                    var overwrittenKeys = Object.keys(registration.settings.overwrittenKeys);
                    var errors = [];
                    overwrittenKeys.forEach(function (overwrittenKey) {
                        _this._validateOverwrittenKey(registration, overwrittenKey, errors);
                    });
                    return errors;
                };
                DependencyInjectionContainer.prototype._validateOverwrittenKey = function (registration, overwrittenKey, errors) {
                    if (registration.settings.dependencies.indexOf(overwrittenKey) < 0) {
                        errors.push("No dependency for overwritten key '" + overwrittenKey + "' has been declared on registration for key '" + registration.settings.key + "'.");
                    }
                    var overwrittenKeyValue = registration.settings.overwrittenKeys[overwrittenKey];
                    var overwrittenKeyRegistration = this._getRegistration(overwrittenKeyValue);
                    if (!overwrittenKeyRegistration) {
                        errors.push("Registration for overwritten key '" + overwrittenKey + "' declared on registration for key '" + registration.settings.key + "' is missing.");
                    }
                };
                DependencyInjectionContainer.prototype._squashArgumentsToArray = function (args) {
                    var allArgs = [];
                    args.forEach(function (arg) {
                        if (Array.isArray(arg)) {
                            Array.prototype.push.apply(allArgs, arg);
                        }
                        else if (typeof arg === 'string') {
                            allArgs.push(arg);
                        }
                    });
                    return allArgs;
                };
                DependencyInjectionContainer.prototype.getKeysByTags = function () {
                    var _this = this;
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    var allTags = this._squashArgumentsToArray(args);
                    var foundKeys = [];
                    var registrationKeys = Object.keys(this.registrations);
                    registrationKeys.forEach(function (registrationKey) {
                        var registration = _this.registrations[registrationKey];
                        if (registration.hasTags(allTags)) {
                            foundKeys.push(registration.settings.key);
                        }
                    });
                    return foundKeys;
                };
                DependencyInjectionContainer.prototype.getKeysByAttributes = function (attributes) {
                    var _this = this;
                    var foundKeys = [];
                    var attributeKeys = Object.keys(attributes);
                    var registrationKeys = this.getKeysByTags(attributeKeys);
                    registrationKeys.forEach(function (registrationKey) {
                        var registration = _this._getRegistration(registrationKey);
                        var registrationHasAttributes = registration.hasAttributes(attributes);
                        if (registrationHasAttributes) {
                            foundKeys.push(registration.settings.key);
                        }
                    });
                    return foundKeys;
                };
                DependencyInjectionContainer.prototype.isRegistered = function (key) {
                    var registrationKeys = Object.keys(this.registrations);
                    var found = registrationKeys.some(function (registrationKey) {
                        if (registrationKey == key) {
                            return true;
                        }
                    });
                    return found;
                };
                return DependencyInjectionContainer;
            }());
            exports_1("DependencyInjectionContainer", DependencyInjectionContainer);
            TypeRegistration = (function () {
                function TypeRegistration(defaults, key, type, isFactory) {
                    this._settings = undefined;
                    this._settings = new TypeRegistrationSettings(defaults, key, type, isFactory);
                }
                Object.defineProperty(TypeRegistration.prototype, "settings", {
                    get: function () {
                        return this._settings;
                    },
                    set: function (value) {
                        this._settings = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                TypeRegistration.prototype.dependencies = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    var resolvedDepedencyConfigurations = [];
                    args.forEach(function (currentDependencyConfiguration) {
                        var dependencyType = typeof currentDependencyConfiguration;
                        if (Array.isArray(currentDependencyConfiguration)) {
                            Array.prototype.push.apply(resolvedDepedencyConfigurations, currentDependencyConfiguration);
                        }
                        else if (dependencyType === 'string' || dependencyType === 'function') {
                            resolvedDepedencyConfigurations.push(currentDependencyConfiguration);
                        }
                        else {
                            throw new Error("The type '" + dependencyType + "' of your dependencies declaration is not yet supported.\n                Supported types: 'Array', 'String', 'Function(Type)'");
                        }
                    });
                    this.settings.dependencies = resolvedDepedencyConfigurations;
                    return this;
                };
                TypeRegistration.prototype.configure = function (config) {
                    var configType = typeof config;
                    if (configType !== 'function' && configType !== 'object' && configType !== 'string') {
                        throw new Error("The type '" + configType + "' of your dependencies declaration is not yet supported.\n              Supported types: 'Function', 'Object'");
                    }
                    this.settings.config = config;
                    return this;
                };
                TypeRegistration.prototype.singleton = function (isSingleton) {
                    this.settings.isSingleton = !!isSingleton ? isSingleton : true;
                    return this;
                };
                TypeRegistration.prototype.noInjection = function (injectionDisabled) {
                    if (this.settings.injectInto) {
                        throw new Error("'noInjection' induces a conflict to the 'injectInto' declaration.");
                    }
                    if (this.settings.isLazy) {
                        throw new Error("'noInjection' induces a conflict to the 'injectLazy' declaration.");
                    }
                    this.settings.wantsInjection = !!injectionDisabled ? !injectionDisabled : false;
                    return this;
                };
                TypeRegistration.prototype.injectInto = function (targetFunction) {
                    if (!this.settings.wantsInjection) {
                        throw new Error("'injectInto' induces a conflict to the 'noInjection' declaration.");
                    }
                    this.settings.injectInto = targetFunction;
                    return this;
                };
                TypeRegistration.prototype.injectLazy = function () {
                    if (!this.settings.wantsInjection) {
                        throw new Error("'injectLazy' induces a conflict to the 'noInjection' declaration.");
                    }
                    this.settings.isLazy = true;
                    if (arguments.length > 0) {
                        Array.prototype.push.apply(this.settings.lazyKeys, arguments);
                    }
                    return this;
                };
                TypeRegistration.prototype.onNewInstance = function (key, targetFunction) {
                    var subscription = {
                        key: key,
                        method: targetFunction
                    };
                    this.settings.subscriptions['newInstance'].push(subscription);
                    return this;
                };
                TypeRegistration.prototype.bindFunctions = function () {
                    this.settings.bindFunctions = true;
                    if (arguments.length > 0) {
                        Array.prototype.push.apply(this.settings.functionsToBind, arguments);
                    }
                    return this;
                };
                TypeRegistration.prototype.tags = function (tagOrTags) {
                    var _this = this;
                    for (var argumentIndex = 0; argumentIndex < arguments.length; argumentIndex++) {
                        var argument = arguments[argumentIndex];
                        var argumentType = typeof argument;
                        if (Array.isArray(argument)) {
                            argument.forEach(function (tag) {
                                _this.settings.tags[tag] = {};
                            });
                        }
                        else if (argumentType === 'string') {
                            this.settings.tags[argument] = {};
                        }
                        else {
                            throw new Error("The type '" + argumentType + "' of your tags declaration is not yet supported.\n                Supported types: 'Array', 'String'");
                        }
                    }
                    return this;
                };
                TypeRegistration.prototype.setAttribute = function (tag, value) {
                    if (!tag) {
                        throw new Error("You have to specify a tag for your attribute.");
                    }
                    this.settings.tags[tag] = value;
                    return this;
                };
                TypeRegistration.prototype.hasTags = function (tags) {
                    var declaredTags = Object.keys(this.settings.tags);
                    if (!Array.isArray(tags)) {
                        tags = [tags];
                    }
                    var isTagMissing = tags.some(function (tag) {
                        if (declaredTags.indexOf(tag) < 0) {
                            return true;
                        }
                    });
                    return !isTagMissing;
                };
                TypeRegistration.prototype.hasAttributes = function (attributes) {
                    var _this = this;
                    var attributeKeys = Object.keys(attributes);
                    var attributeMissing = attributeKeys.some(function (attribute) {
                        var attributeValue = _this.settings.tags[attribute];
                        if (attributeValue !== attributes[attribute]) {
                            return true;
                        }
                    });
                    return !attributeMissing;
                };
                TypeRegistration.prototype.overwrite = function (originalKey, overwrittenKey) {
                    if (this.settings.dependencies.indexOf(originalKey) < 0) {
                        throw new Error("there is no dependency declared for original key '" + originalKey + "'.");
                    }
                    this.settings.overwrittenKeys[originalKey] = overwrittenKey;
                    return this;
                };
                return TypeRegistration;
            }());
            exports_1("TypeRegistration", TypeRegistration);
            TypeRegistrationSettings = (function () {
                function TypeRegistrationSettings(defaults, key, type, isFactory, isObject) {
                    this._defaults = undefined;
                    this._key = undefined;
                    this._type = undefined;
                    this._dependencies = undefined;
                    this._config = undefined;
                    this._tags = undefined;
                    this._injectInto = undefined;
                    this._functionsToBind = undefined;
                    this._lazyKeys = undefined;
                    this._overwrittenKeys = undefined;
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
                    set: function (value) {
                        this._overwrittenKeys = value;
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
                    return typeof this[("_" + key)] !== 'undefined' ? this[("_" + key)] : this.defaults[key];
                };
                return TypeRegistrationSettings;
            }());
            exports_1("TypeRegistrationSettings", TypeRegistrationSettings);
        }
    }
});
