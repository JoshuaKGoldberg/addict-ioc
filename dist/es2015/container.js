import { TypeRegistration } from './type_registration';
export class DependencyInjectionContainer {
    constructor(config) {
        this._config = undefined;
        this._registrations = {};
        this._instances = {};
        this._externalConfigProvider = undefined;
        const configuration = config || this._getDefaultConfiguration();
        this._config = configuration;
        this._initializeRegistrationDeclarations();
        this._initializeBaseRegistrations();
    }
    _getDefaultConfiguration() {
        return {
            registrationDefaults: {
                isSingleton: false,
                wantsInjection: true,
                isLazy: false,
                bindFunctions: false,
                autoCreateMissingSubscribers: true
            },
            injectContainerKey: 'container',
            circularDependencyCanIncludeSingleton: true,
            circularDependencyCanIncludeLazy: true
        };
    }
    clear() {
        this._registrations = {};
        this._instances = {};
        this._initializeBaseRegistrations();
    }
    get config() {
        return this._config;
    }
    get registrations() {
        return this._registrations;
    }
    get instances() {
        return this._instances;
    }
    get externalConfigProvider() {
        return this._externalConfigProvider;
    }
    setConfigProvider(configProvider) {
        if (typeof configProvider === 'function' && configProvider !== null) {
            this._externalConfigProvider = configProvider;
        }
        else {
            throw new Error('Config provider must be a function.');
        }
    }
    setDefaults(registrationDefaults) {
        if (registrationDefaults) {
            const defaultSettings = [
                'isSingleton',
                'wantsInjection',
                'isLazy',
                'bindFunctions',
                'autoCreateMissingSubscribers'
            ];
            defaultSettings.forEach((defaultSetting) => {
                const defaultSettingValue = registrationDefaults[defaultSetting];
                this._setDefault(defaultSetting, defaultSettingValue);
            });
        }
    }
    _setDefault(settingKey, value) {
        if (this._isValidBoolean(value)) {
            this.config.registrationDefaults[settingKey] = value;
            return true;
        }
        return false;
    }
    _isValidBoolean(settingValue) {
        return typeof settingValue === 'boolean';
    }
    register(key, type) {
        const keyType = typeof key;
        let currentRegistration;
        if (keyType === 'string') {
            currentRegistration = this._registerTypeByKey(key, type);
        }
        else {
            throw new Error(`The key type '${key}' is not supported.`);
        }
        this.registrations[key] = currentRegistration;
        return currentRegistration;
    }
    unregister(key) {
        if (this.registrations[key]) {
            delete this.registrations[key];
        }
        else {
            throw new Error(`The key '${key}' is not registered.`);
        }
    }
    _registerTypeByKey(key, type) {
        if (!key) {
            throw new Error(`No key specified for registration of type '${type}'`);
        }
        if (!type) {
            throw new Error(`No type specified for registration of key '${key}'`);
        }
        return new TypeRegistration(this.config.registrationDefaults, key, type);
    }
    registerFactory(key, factoryMethod) {
        if (typeof key !== 'string') {
            throw new Error(`No key specified for registration of factory function '${factoryMethod}'`);
        }
        const currentRegistration = new TypeRegistration(this.config.registrationDefaults, key, factoryMethod, true);
        this.registrations[key] = currentRegistration;
        return currentRegistration;
    }
    registerObject(key, object) {
        const keyType = typeof key;
        let currentRegistration;
        if (keyType === 'string') {
            if (!key) {
                throw new Error(`No key specified for registration of type '${keyType}'`);
            }
            currentRegistration = new TypeRegistration(this.config.registrationDefaults, key, object);
        }
        else {
            throw new Error(`The key type '${key}' is not supported.`);
        }
        this.registrations[key] = currentRegistration;
        currentRegistration.settings.isObject = true;
        return currentRegistration;
    }
    _initializeBaseRegistrations() {
        this.registerObject(this.config.injectContainerKey, this);
    }
    _initializeRegistrationDeclarations() {
        const declarations = [
            'dependencies',
            'configure',
            'singleton',
            'noInjection',
            'injectInto',
            'injectLazy',
            'onNewInstance',
            'bindFunctions'
        ];
        declarations.forEach((declaration) => {
            this[declaration] = () => {
                this._ensureRegistrationStarted(declaration);
            };
        });
    }
    _ensureRegistrationStarted(declaration) {
        throw new Error(`There is no registration present to use '${declaration}'.
        You can start a registration by calling the 'register' method.`);
    }
    _getRegistration(key) {
        const registration = this.registrations[key];
        if (registration) {
            return registration;
        }
        throw new Error(`There is no registration created for key '${key}'.`);
    }
    resolve(key, injectionArgs, config) {
        return this._resolve(key, injectionArgs, config);
    }
    _resolve(key, injectionArgs, config, resolvedKeyHistory, isLazy) {
        if (typeof injectionArgs !== 'undefined' && !Array.isArray(injectionArgs)) {
            throw new Error(`Injection args must be of type 'Array'.`);
        }
        const registration = this._getRegistration(key);
        if (registration.settings.isObject) {
            if (isLazy) {
                return () => {
                    return registration.settings.type;
                };
            }
            return registration.settings.type;
        }
        return this._resolveInstance(registration, injectionArgs, config, resolvedKeyHistory, isLazy);
    }
    _resolveInstance(registration, injectionArgs, config, resolvedKeyHistory, isLazy) {
        const resolvedRegistrationConfig = this._getConfig(registration.settings.key);
        const resolvedRuntimeConfig = this._resolveConfig(registration.settings.key, config);
        const configUsed = this._mergeConfig(resolvedRegistrationConfig, resolvedRuntimeConfig);
        if (registration.settings.isSingleton) {
            if (isLazy) {
                return (lazyInjectionArgs, lazyConfig) => {
                    const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);
                    const lazyConfigUsed = this._mergeConfig(configUsed, lazyConfig);
                    return this._getInstance(registration, injectionArgsUsed, lazyConfigUsed, []);
                };
            }
            else {
                const newResolvedKeyHistory = resolvedKeyHistory ? resolvedKeyHistory.concat([]) : [];
                return this._getInstance(registration, injectionArgs, configUsed, newResolvedKeyHistory);
            }
        }
        if (isLazy) {
            return (lazyInjectionArgs, lazyConfig) => {
                const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);
                const lazyConfigUsed = this._mergeConfig(configUsed, lazyConfig);
                return this._getNewInstance(registration, injectionArgsUsed, lazyConfigUsed, []);
            };
        }
        const newResolvedKeyHistory = resolvedKeyHistory ? resolvedKeyHistory.concat([]) : [];
        return this._getNewInstance(registration, injectionArgs, configUsed, newResolvedKeyHistory);
    }
    _mergeArguments(baseArgs, additionalArgs) {
        if (additionalArgs && !Array.isArray(additionalArgs)) {
            throw new Error('Arguments have to be of type Array');
        }
        if (!baseArgs) {
            return additionalArgs;
        }
        const argsUsed = baseArgs || undefined;
        if (!Array.isArray(argsUsed)) {
            throw new Error('Arguments have to be of type Array');
        }
        const finalArgs = Array.prototype.push.apply(argsUsed, additionalArgs);
        return finalArgs;
    }
    _mergeConfig(baseConfig, additionalConfig) {
        const configUsed = baseConfig || undefined;
        if (!configUsed) {
            return additionalConfig;
        }
        const finalConfig = Object.assign(configUsed, additionalConfig);
        return finalConfig;
    }
    _getInstance(registration, injectionArgs, config, resolvedKeyHistory) {
        let instances = this.instances[registration.settings.key];
        let instance = null;
        if (typeof instances === 'undefined') {
            return this._getNewInstance(registration, injectionArgs, config, resolvedKeyHistory);
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
    }
    _getKeysForInstanceConfigurationsByKey(key) {
        const instance = this.instances[key];
        if (!instance) {
            return null;
        }
        return Object.keys(instance);
    }
    _getKeysForInstanceInjectionArgumentsByKeyAndConfig(key, config) {
        const instance = this.instances[key][config];
        if (!instance) {
            return null;
        }
        return Object.keys(instance);
    }
    _getAllInstances(key, config, injectionArgs) {
        const configKeys = [];
        if (config) {
            configKeys.push(config);
        }
        else {
            Array.prototype.push.apply(configKeys, this._getKeysForInstanceConfigurationsByKey(key));
        }
        if (configKeys.length === 0) {
            return null;
        }
        const allInstances = [];
        configKeys.forEach((configKey) => {
            const instanceInjectionArgumentKeys = this._getKeysForInstanceInjectionArgumentsByKeyAndConfig(key, config);
            if (!instanceInjectionArgumentKeys) {
                return;
            }
            instanceInjectionArgumentKeys.forEach((instanceInjectionArgumentKey) => {
                Array.prototype.push.apply(allInstances, this.instances[key][configKey][instanceInjectionArgumentKey]);
            });
        });
        return allInstances;
    }
    _getNewInstance(registration, injectionArgs, config, resolvedKeyHistory) {
        if (Array.isArray(resolvedKeyHistory) && resolvedKeyHistory.indexOf(registration.settings.key) >= 0) {
            throw new Error(`Circular dependency on key '${registration.settings.key}' detected.`);
        }
        const dependencies = this._resolveDependencies(registration, resolvedKeyHistory);
        const instance = this._createInstance(registration, dependencies, injectionArgs);
        this._configureInstance(instance, config);
        this._callSubscribers(registration, 'newInstance', instance);
        this._bindFunctionsToInstance(registration, instance);
        this._cacheInstance(registration.settings.key, instance, injectionArgs, config);
        return instance;
    }
    _bindFunctionsToInstance(registration, instance) {
        if (!registration.settings.bindFunctions) {
            return;
        }
        let instanceKeys;
        if (registration.settings.functionsToBind.length > 0) {
            instanceKeys = registration.settings.functionsToBind;
        }
        else {
            const instancePrototype = Object.getPrototypeOf(instance);
            instanceKeys = Object.getOwnPropertyNames(instancePrototype);
        }
        instanceKeys.forEach((instanceKey) => {
            if (instanceKey === 'constructor') {
                return;
            }
            const keyType = typeof instance[instanceKey];
            if (keyType === 'function') {
                const unboundKey = instance[instanceKey];
                instance[instanceKey] = unboundKey.bind(instance);
            }
        });
    }
    resolveDependencies(key) {
        const registration = this._getRegistration(key);
        return this._resolveDependencies(registration);
    }
    _resolveDependencies(registration, resolvedKeyHistory) {
        const resolvedDependencies = [];
        const configuredDependencies = registration.settings.dependencies;
        if (!configuredDependencies) {
            return resolvedDependencies;
        }
        let dependencies;
        const dependenciesType = typeof configuredDependencies;
        if (Array.isArray(registration.settings.dependencies)) {
            dependencies = configuredDependencies;
        }
        else if (dependenciesType === 'string') {
            dependencies = [configuredDependencies];
        }
        else {
            throw new Error(`The type '${dependenciesType}' of your dependencies declaration is not yet supported.
        Supported types: 'Array', 'String'`);
        }
        if (!resolvedKeyHistory) {
            resolvedKeyHistory = [];
        }
        resolvedKeyHistory.push(registration.settings.key);
        dependencies.forEach((dependency) => {
            const isLazy = this._isDependencyLazy(registration, dependency);
            const dependencyKey = this._getDependencyKeyOverwritten(registration, dependency);
            const dependencyInstance = this._resolve(dependencyKey, undefined, undefined, resolvedKeyHistory, isLazy);
            resolvedDependencies.push(dependencyInstance);
        });
        return resolvedDependencies;
    }
    _isDependencyLazy(registration, dependency) {
        const isLazy = registration.settings.isLazy && (registration.settings.lazyKeys.length === 0 || registration.settings.lazyKeys.indexOf(dependency) >= 0);
        return isLazy;
    }
    _getDependencyKeyOverwritten(registration, dependency) {
        let dependencyKey = dependency;
        if (registration.settings.overwrittenKeys[dependency]) {
            dependencyKey = registration.settings.overwrittenKeys[dependency];
        }
        return dependencyKey;
    }
    _createInstance(registration, dependencies, injectionArgs) {
        let instance;
        let type = registration.settings.type;
        const argumentsToBeInjected = dependencies.concat(injectionArgs);
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
    }
    _createInstanceByFactory(type) {
        const instance = type();
        return instance;
    }
    _createInstanceByFactoryWithInjection(type, argumentsToBeInjected) {
        const instance = type.apply(undefined, argumentsToBeInjected);
        return instance;
    }
    _createInstanceByConstructor(type) {
        const instance = new type();
        return instance;
    }
    _createInstanceByConstructorWithInjection(type, argumentsToBeInjected) {
        const instance = new type(...argumentsToBeInjected);
        return instance;
    }
    _injectDependenciesIntoInstance(registration, instance, argumentsToBeInjected) {
        let propertySource;
        if (registration.settings.isFactory) {
            propertySource = instance;
        }
        else {
            propertySource = Object.getPrototypeOf(instance);
        }
        const injectionTargetPropertyDescriptor = this._getPropertyDescriptor(propertySource, registration.settings.injectInto);
        if (injectionTargetPropertyDescriptor) {
            if (typeof injectionTargetPropertyDescriptor.value === 'function') {
                this._injectDependenciesIntoFunction(instance, injectionTargetPropertyDescriptor.value, argumentsToBeInjected);
            }
            else if (injectionTargetPropertyDescriptor.set) {
                this._injectDependenciesIntoProperty(instance, registration.settings.injectInto, argumentsToBeInjected);
            }
            else {
                throw new Error(`The setter for the '${registration.settings.injectInto}' property on type '${Object.getPrototypeOf(instance).constructor.name}' is missing.`);
            }
        }
        else {
            throw new Error(`The injection target '${registration.settings.injectInto}' on type '${Object.getPrototypeOf(instance).constructor.name}' is missing.`);
        }
    }
    _getPropertyDescriptor(type, key) {
        const propertyDescriptor = Object.getOwnPropertyDescriptor(type, key);
        if (propertyDescriptor) {
            return propertyDescriptor;
        }
        const prototype = Object.getPrototypeOf(type);
        if (!prototype) {
            return undefined;
        }
        return this._getPropertyDescriptor(prototype, key);
    }
    _injectDependenciesIntoFunction(instance, targetFunction, argumentsToBeInjected) {
        targetFunction.apply(targetFunction, argumentsToBeInjected);
    }
    _injectDependenciesIntoProperty(instance, property, argumentsToBeInjected) {
        instance[property] = argumentsToBeInjected;
    }
    _getSubscriberRegistrations(key, subscriptionKey) {
        const subscribers = [];
        const registrationKeys = Object.keys(this.registrations);
        registrationKeys.forEach((registrationKey) => {
            const registration = this.registrations[registrationKey];
            registration.settings.subscriptions[subscriptionKey].some((subscription) => {
                if (subscription.key === key || subscription.key === '*') {
                    subscribers.push(registration);
                    return true;
                }
            });
        });
        return subscribers;
    }
    _getSubscriptionFromRegistrationByKey(registration, subscriptionKey, key) {
        let resultSubscription = null;
        registration.settings.subscriptions[subscriptionKey].some((subscription) => {
            if (subscription.key === key) {
                resultSubscription = subscription;
                return true;
            }
        });
        return resultSubscription;
    }
    _callSubscribers(registration, subscriptionKey, params) {
        const subscriberRegistrations = this._getSubscriberRegistrations(registration.settings.key, subscriptionKey);
        subscriberRegistrations.forEach((subscriberRegistration) => {
            let subscribedInstances = this._getAllInstances(subscriberRegistration.settings.key);
            if (subscribedInstances === null) {
                const newInstance = this._createMissingSubscriber(subscriberRegistration);
                subscribedInstances = [newInstance];
            }
            subscribedInstances.forEach((subscribedInstance) => {
                this._callSubscriber(registration, subscriptionKey, subscriberRegistration, subscribedInstance, params);
            });
        });
    }
    _createMissingSubscriber(subscriberRegistration) {
        if (subscriberRegistration.settings.autoCreateMissingSubscribers) {
            return this._getNewInstance(subscriberRegistration);
        }
        throw new Error(`There is no instance created for key '${subscriberRegistration.settings.key}'.`);
    }
    _callSubscriber(subscribedRegistration, subscriptionKey, subscriberRegistration, subscribedInstance, params) {
        if (!Array.isArray(params)) {
            params = [params];
        }
        const methodSubscription = this._getSubscriptionFromRegistrationByKey(subscriberRegistration, subscriptionKey, subscribedRegistration.settings.key);
        const subscribedMethod = subscribedInstance[methodSubscription.method];
        subscribedMethod.apply(subscribedInstance, params);
    }
    _configureInstance(instance, config) {
        if (!config) {
            return;
        }
        const configPropertyDescriptor = this._getPropertyDescriptor(instance, 'config');
        if (configPropertyDescriptor === undefined || (!configPropertyDescriptor.writable && !configPropertyDescriptor.set)) {
            const instancePrototype = Object.getPrototypeOf(instance);
            throw new Error(`The setter for the config property on type '${instancePrototype.constructor.name}' is missing.`);
        }
        instance.config = config;
    }
    _cacheInstance(key, instance, injectionArgs, config) {
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
    }
    _getConfig(key) {
        const config = this.registrations[key].settings.config;
        const resolvedConfig = this._resolveConfig(key, config);
        if (!resolvedConfig) {
            return undefined;
        }
        return resolvedConfig;
    }
    _resolveConfig(key, config) {
        const registration = this.registrations[key];
        let resolvedConfig;
        const configType = typeof config;
        if (configType === 'function') {
            resolvedConfig = config(key);
            if (!resolvedConfig) {
                throw new Error(`The specified config function for registration key ${registration.settings.key} returned undefined.`);
            }
        }
        else if (configType === 'object') {
            resolvedConfig = config;
            if (!resolvedConfig) {
                throw new Error(`The specified config for registration key ${registration.settings.key} is undefined.`);
            }
        }
        else if (configType === 'string') {
            if (typeof this.externalConfigProvider !== 'function' || this.externalConfigProvider === null) {
                throw new Error(`The specified config for registration key ${registration.settings.key} is null.`);
            }
            resolvedConfig = this.externalConfigProvider(config, registration);
            if (!resolvedConfig) {
                throw new Error(`The specified config for registration key ${registration.settings.key} is null.`);
            }
        }
        else {
            resolvedConfig = undefined;
        }
        return resolvedConfig;
    }
    validateDependencies(key) {
        let registrationKeys;
        if (Array.isArray(key)) {
            registrationKeys = key;
        }
        else if (typeof key !== 'undefined') {
            registrationKeys = [key];
        }
        else {
            registrationKeys = Object.keys(this.registrations);
        }
        const errors = this._validateDependencies(registrationKeys);
        if (errors.length > 0) {
            throw new Error(`Errors during validation of dependencies:
          ${errors.toString()}`);
        }
    }
    _validateDependencies(registrationKeys, parentRegistrationHistory) {
        const errors = [];
        registrationKeys.forEach((registrationKey) => {
            const registration = this.registrations[registrationKey];
            const dependencies = registration.settings.dependencies;
            if (!parentRegistrationHistory) {
                parentRegistrationHistory = [];
            }
            else if (parentRegistrationHistory.indexOf(registration) >= 0) {
                errors.push(`Circular dependency on key '${registrationKey}' detected.`);
                return;
            }
            const subParentRegistrationHistory = [];
            Array.prototype.push.apply(subParentRegistrationHistory, parentRegistrationHistory);
            subParentRegistrationHistory.push(registration);
            if (!dependencies) {
                return;
            }
            for (let dependencyIndex = 0; dependencyIndex < dependencies.length; dependencyIndex++) {
                const originalDependencyKey = dependencies[dependencyIndex];
                const originalDependencyKeyRegistration = this.registrations[originalDependencyKey];
                const dependencyKeyOverwritten = this._getDependencyKeyOverwritten(registration, originalDependencyKey);
                if (!originalDependencyKeyRegistration) {
                    errors.push(`Registration for '${originalDependencyKey}' overwritten with '${dependencyKeyOverwritten}' declared on registered for key '${registration.settings.key}' is missing.`);
                }
                const dependencyRegistration = this.registrations[dependencyKeyOverwritten];
                if (!dependencyRegistration) {
                    if (originalDependencyKey !== dependencyKeyOverwritten) {
                        errors.push(`Dependency '${originalDependencyKey}' overwritten with key '${dependencyKeyOverwritten}' declared on '${registration.settings.key}' is missing.`);
                    }
                    else {
                        errors.push(`Dependency '${dependencyKeyOverwritten}' declared on '${registration.settings.key}' is missing.`);
                    }
                }
                else if (dependencyRegistration.settings.dependencies) {
                    const overwrittenKeyValidationErrors = this._validateOverwrittenKeys(registration);
                    Array.prototype.push.apply(errors, overwrittenKeyValidationErrors);
                    const circularBreakFound = this._historyHasCircularBreak(subParentRegistrationHistory, dependencyRegistration);
                    if (!circularBreakFound) {
                        const deepErrors = this._validateDependencies([dependencyRegistration.settings.key], subParentRegistrationHistory);
                        if (deepErrors.length > 0) {
                            errors.push(`Inner dependency errors for dependency '${dependencyKeyOverwritten}':
                  ${deepErrors.toString()}`);
                        }
                    }
                }
            }
        });
        return errors;
    }
    _historyHasCircularBreak(parentRegistrationHistory, dependencyRegistration) {
        return parentRegistrationHistory.some((parentRegistration) => {
            const parentSettings = parentRegistration.settings;
            if (this.config.circularDependencyCanIncludeSingleton && parentSettings.isSingleton) {
                return true;
            }
            if (this.config.circularDependencyCanIncludeLazy && parentSettings.isLazy) {
                if (parentSettings.lazyKeys.length === 0 ||
                    parentSettings.lazyKeys.indexOf(dependencyRegistration.settings.key) >= 0) {
                    return true;
                }
            }
        });
    }
    _validateOverwrittenKeys(registration) {
        const overwrittenKeys = Object.keys(registration.settings.overwrittenKeys);
        const errors = [];
        overwrittenKeys.forEach((overwrittenKey) => {
            this._validateOverwrittenKey(registration, overwrittenKey, errors);
        });
        return errors;
    }
    _validateOverwrittenKey(registration, overwrittenKey, errors) {
        if (registration.settings.dependencies.indexOf(overwrittenKey) < 0) {
            errors.push(`No dependency for overwritten key '${overwrittenKey}' has been declared on registration for key '${registration.settings.key}'.`);
        }
        const overwrittenKeyValue = registration.settings.overwrittenKeys[overwrittenKey];
        const overwrittenKeyRegistration = this._getRegistration(overwrittenKeyValue);
        if (!overwrittenKeyRegistration) {
            errors.push(`Registration for overwritten key '${overwrittenKey}' declared on registration for key '${registration.settings.key}' is missing.`);
        }
    }
    _squashArgumentsToArray(args) {
        const allArgs = [];
        args.forEach((arg) => {
            if (Array.isArray(arg)) {
                Array.prototype.push.apply(allArgs, arg);
            }
            else if (typeof arg === 'string') {
                allArgs.push(arg);
            }
        });
        return allArgs;
    }
    getKeysByTags(...args) {
        const allTags = this._squashArgumentsToArray(args);
        const foundKeys = [];
        const registrationKeys = Object.keys(this.registrations);
        registrationKeys.forEach((registrationKey) => {
            const registration = this.registrations[registrationKey];
            if (registration.hasTags(allTags)) {
                foundKeys.push(registration.settings.key);
            }
        });
        return foundKeys;
    }
    getKeysByAttributes(attributes) {
        const foundKeys = [];
        const attributeKeys = Object.keys(attributes);
        const registrationKeys = this.getKeysByTags(attributeKeys);
        registrationKeys.forEach((registrationKey) => {
            const registration = this._getRegistration(registrationKey);
            const registrationHasAttributes = registration.hasAttributes(attributes);
            if (registrationHasAttributes) {
                foundKeys.push(registration.settings.key);
            }
        });
        return foundKeys;
    }
    isRegistered(key) {
        const registrationKeys = Object.keys(this.registrations);
        const found = registrationKeys.some((registrationKey) => {
            if (registrationKey == key) {
                return true;
            }
        });
        return found;
    }
}

//# sourceMappingURL=container.js.map
