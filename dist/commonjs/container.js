"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const registry_1 = require("./registry");
const default_settings_1 = require("./default_settings");
const utils_1 = require("./utils");
const uuid = require("node-uuid");
class Container extends registry_1.Registry {
    constructor(settings = default_settings_1.DefaultSettings, parentContainer, parentRegistry) {
        super(Object.assign(Object.assign({}, default_settings_1.DefaultSettings), settings), parentRegistry);
        this.instances = {};
        this.parentContainer = parentContainer;
        this.settings = Object.assign(Object.assign({}, default_settings_1.DefaultSettings), settings);
        this.initialize();
    }
    initialize() {
        this.instances = {};
        this.registerObject(this.settings.containerRegistrationKey, this);
    }
    clear() {
        this.clear();
        this.initialize();
    }
    _orderDependencies(registration, results, missing, recursive, nest = []) {
        for (let dependencyKey of registration.settings.dependencies) {
            dependencyKey = this._getDependencyKeyOverwritten(registration, dependencyKey);
            if (results.indexOf(dependencyKey) !== -1) {
                return;
            }
            const dependency = this.getRegistration(dependencyKey);
            if (!dependency) {
                missing.push(dependencyKey);
            }
            else if (nest.indexOf(dependencyKey) > -1) {
                nest.push(dependencyKey);
                recursive.push(nest.slice(0));
                nest.pop();
            }
            else if (dependency.settings.dependencies.length) {
                nest.push(dependencyKey);
                this._orderDependencies(dependency, results, missing, recursive, nest);
                nest.pop();
            }
            results.push(dependencyKey);
        }
    }
    _createNewResolutionContext(registration) {
        const id = this._createInstanceId();
        const currentResolution = {
            id: id,
            registration: registration,
            ownedInstances: []
        };
        const resolutionContext = {
            currentResolution: currentResolution,
            history: [],
            instanceLookup: {},
            instanceResolutionOrder: []
        };
        resolutionContext.instanceLookup[id] = currentResolution;
        return resolutionContext;
    }
    resolve(key, injectionArgs = [], config) {
        const registration = this.getRegistration(key);
        const resolutionContext = this._createNewResolutionContext(registration);
        return this._resolve(registration, resolutionContext, injectionArgs, config);
    }
    resolveAsync(key, injectionArgs = [], config) {
        const registration = this.getRegistration(key);
        const resolutionContext = this._createNewResolutionContext(registration);
        return this._resolveAsync(registration, resolutionContext, injectionArgs, config);
    }
    _resolve(registration, resolutionContext, injectionArgs = [], config) {
        if (registration.settings.isObject) {
            return this._resolveObject(registration, resolutionContext, injectionArgs, config);
        }
        if (registration.settings.isFactory) {
            return this._resolveFactory(registration, resolutionContext, injectionArgs, config);
        }
        return this._resolveTypeInstance(registration, resolutionContext, injectionArgs, config);
    }
    async _resolveAsync(registration, resolutionContext, injectionArgs = [], config) {
        if (registration.settings.isObject) {
            return await this._resolveObjectAsync(registration, resolutionContext, injectionArgs, config);
        }
        if (registration.settings.isFactory) {
            return await this._resolveFactoryAsync(registration, resolutionContext, injectionArgs, config);
        }
        return await this._resolveTypeInstanceAsync(registration, resolutionContext, injectionArgs, config);
    }
    resolveLazy(key, injectionArgs = [], config) {
        const registration = this.getRegistration(key);
        const resolutionContext = this._createNewResolutionContext(registration);
        return this._resolveLazy(registration, resolutionContext, injectionArgs, config);
    }
    resolveLazyAsync(key, injectionArgs = [], config) {
        const registration = this.getRegistration(key);
        const resolutionContext = this._createNewResolutionContext(registration);
        return this._resolveLazyAsync(registration, resolutionContext, injectionArgs, config);
    }
    _resolveLazy(registration, resolutionContext, injectionArgs = [], config) {
        return (lazyInjectionArgs, lazyConfig) => {
            const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);
            const lazyConfigUsed = this._mergeConfigs(config, lazyConfig);
            return this._resolve(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
        };
    }
    _resolveLazyAsync(registration, resolutionContext, injectionArgs = [], config) {
        return (lazyInjectionArgs, lazyConfig) => {
            const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);
            const lazyConfigUsed = this._mergeConfigs(config, lazyConfig);
            return this._resolveAsync(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
        };
    }
    _resolveObject(registration, resolutionContext, injectionArgs, config) {
        const configUsed = this._mergeRegistrationConfig(registration, config);
        const dependencies = this._resolveDependencies(registration, resolutionContext);
        const object = this._createObject(registration, dependencies, injectionArgs);
        this._configureInstance(object, registration, configUsed);
        return object;
    }
    async _resolveObjectAsync(registration, resolutionContext, injectionArgs, config) {
        const configUsed = this._mergeRegistrationConfig(registration, config);
        const dependencies = this._resolveDependencies(registration, resolutionContext);
        const object = await this._createObjectAsync(registration, dependencies, injectionArgs);
        this._configureInstance(object, registration, configUsed);
        return object;
    }
    _resolveFactory(registration, resolutionContext, injectionArgs, config) {
        const configUsed = this._mergeRegistrationConfig(registration, config);
        const dependencies = this._resolveDependencies(registration, resolutionContext);
        const factory = this._createFactory(registration, dependencies, injectionArgs);
        this._configureInstance(factory, registration, configUsed);
        return factory;
    }
    async _resolveFactoryAsync(registration, resolutionContext, injectionArgs, config) {
        const configUsed = this._mergeRegistrationConfig(registration, config);
        const dependencies = this._resolveDependencies(registration, resolutionContext);
        const factory = this._createFactoryAsync(registration, dependencies, injectionArgs);
        this._configureInstance(factory, registration, configUsed);
        return factory;
    }
    _resolveTypeInstance(registration, resolutionContext, injectionArgs, config) {
        const configUsed = this._mergeRegistrationConfig(registration, config);
        if (registration.settings.isSingleton) {
            return this._getTypeInstance(registration, resolutionContext, injectionArgs, configUsed);
        }
        return this._getNewTypeInstance(registration, resolutionContext, injectionArgs, configUsed);
    }
    async _resolveTypeInstanceAsync(registration, resolutionContext, injectionArgs, config) {
        const configUsed = this._mergeRegistrationConfig(registration, config);
        if (registration.settings.isSingleton) {
            return await this._getTypeInstanceAsync(registration, resolutionContext, injectionArgs, configUsed);
        }
        return await this._getNewTypeInstanceAsync(registration, resolutionContext, injectionArgs, configUsed);
    }
    _getTypeInstance(registration, resolutionContext, injectionArgs = [], config) {
        const instances = this._getCachedInstances(registration, injectionArgs, config);
        if (instances.length === 0) {
            return this._getNewTypeInstance(registration, resolutionContext, injectionArgs, config);
        }
        return instances[0];
    }
    async _getTypeInstanceAsync(registration, resolutionContext, injectionArgs = [], config) {
        const instances = this._getCachedInstances(registration, injectionArgs, config);
        if (instances.length === 0) {
            return await this._getNewTypeInstanceAsync(registration, resolutionContext, injectionArgs, config);
        }
        return instances[0];
    }
    _getNewTypeInstance(registration, resolutionContext, injectionArgs = [], config) {
        const configUsed = this._mergeRegistrationConfig(registration, config);
        this._validateResolutionContext(registration, resolutionContext);
        const dependencies = this._resolveDependencies(registration, resolutionContext);
        const instance = this._createType(registration, dependencies, injectionArgs);
        this._configureInstance(instance, registration, configUsed);
        this._cacheInstance(registration, resolutionContext, instance, injectionArgs, config);
        return instance;
    }
    async _getNewTypeInstanceAsync(registration, resolutionContext, injectionArgs = [], config) {
        const configUsed = this._mergeRegistrationConfig(registration, config);
        this._validateResolutionContext(registration, resolutionContext);
        const dependencies = await this._resolveDependenciesAsync(registration, resolutionContext);
        const instance = await this._createType(registration, dependencies, injectionArgs);
        this._configureInstance(instance, registration, configUsed);
        this._cacheInstance(registration, resolutionContext, instance, injectionArgs, config);
        return instance;
    }
    _validateResolutionContext(registration, resolutionContext) {
    }
    _resolveDependencies(registration, resolutionContext) {
        const resolvedDependencies = [];
        const dependencies = registration.settings.dependencies || [];
        dependencies.forEach((dependency) => {
            const resolvedDependency = this._resolveDependency(registration, dependency, resolutionContext);
            resolvedDependencies.push(resolvedDependency);
        });
        return resolvedDependencies;
    }
    async _resolveDependenciesAsync(registration, resolutionContext) {
        const resolvedDependencies = [];
        const dependencies = registration.settings.dependencies || [];
        for (let dependency of dependencies) {
            const resolvedDependency = await this._resolveDependencyAsync(registration, dependency, resolutionContext);
            resolvedDependencies.push(resolvedDependency);
        }
        return resolvedDependencies;
    }
    _resolveDependency(registration, dependencyKey, resolutionContext) {
        const newResolutionContext = this._createChildResolutionContext(registration, resolutionContext);
        const overwrittenDependencyKey = this._getDependencyKeyOverwritten(registration, dependencyKey);
        const dependencyRegistration = this.getRegistration(overwrittenDependencyKey);
        if (!dependencyRegistration) {
            throw new Error(`dependency "${overwrittenDependencyKey}" of key "${registration.settings.key}" is missing`);
        }
        const isOwned = this._isDependencyOwned(registration, overwrittenDependencyKey);
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
    }
    async _resolveDependencyAsync(registration, dependencyKey, resolutionContext) {
        const newResolutionContext = this._createChildResolutionContext(registration, resolutionContext);
        const overwrittenDependencyKey = this._getDependencyKeyOverwritten(registration, dependencyKey);
        const dependencyRegistration = this.getRegistration(dependencyKey);
        if (this._isDependencyLazy(registration, dependencyKey)) {
            return await this._resolveLazy(dependencyRegistration, newResolutionContext, undefined, undefined);
        }
        if (this._isDependencyLazyAsync(registration, dependencyKey)) {
            return await this._resolveLazyAsync(dependencyRegistration, newResolutionContext, undefined, undefined);
        }
        const isOwned = this._isDependencyOwned(registration, overwrittenDependencyKey);
        if (isOwned) {
            newResolutionContext.currentResolution.ownedBy = resolutionContext.currentResolution.id;
            resolutionContext.currentResolution.ownedInstances.push(newResolutionContext.currentResolution.id);
        }
        return await this._resolveAsync(dependencyRegistration, newResolutionContext, undefined, undefined);
    }
    _createObject(registration, dependencies, injectionArgs) {
        const resolver = this._getResolver(registration);
        const object = resolver.resolveObject(this, registration);
        const createdObject = resolver.createObject(this, object, registration, dependencies, injectionArgs);
        return createdObject;
    }
    async _createObjectAsync(registration, dependencies, injectionArgs) {
        const resolver = this._getResolver(registration);
        const object = await resolver.resolveObjectAsync(this, registration);
        const createdObject = resolver.createObject(this, object, registration, dependencies, injectionArgs);
        return createdObject;
    }
    _createFactory(registration, dependencies, injectionArgs) {
        const resolver = this._getResolver(registration);
        const type = resolver.resolveFactory(this, registration);
        const factory = resolver.createFactory(this, type, registration, dependencies, injectionArgs);
        return factory;
    }
    async _createFactoryAsync(registration, dependencies, injectionArgs) {
        const resolver = this._getResolver(registration);
        const type = await resolver.resolveFactoryAsync(this, registration);
        const factory = resolver.createFactory(this, type, registration, dependencies, injectionArgs);
        return factory;
    }
    _createType(registration, dependencies, injectionArgs) {
        const resolver = this._getResolver(registration);
        const type = resolver.resolveType(this, registration);
        const factory = resolver.createInstance(this, type, registration, dependencies, injectionArgs);
        return factory;
    }
    async _createTypeAsync(registration, dependencies, injectionArgs) {
        const resolver = this._getResolver(registration);
        const type = await resolver.resolveTypeAsync(this, registration);
        const instance = resolver.createInstance(this, type, registration, dependencies, injectionArgs);
        return instance;
    }
    _getResolver(registration) {
        return registration.settings.resolver || this.settings.resolver;
    }
    _configureInstance(instance, registration, runtimeConfig) {
        if (!registration.settings.config && !runtimeConfig) {
            return;
        }
        const configPropertyDescriptor = utils_1.getPropertyDescriptor(instance, 'config');
        if (configPropertyDescriptor === undefined || (!configPropertyDescriptor.writable && !configPropertyDescriptor.set)) {
            const instancePrototype = Object.getPrototypeOf(instance);
            throw new Error(`The setter for the config property on type '${instancePrototype.constructor.name}' is missing.`);
        }
        const resolver = this._getResolver(registration);
        const resolvedConfig = resolver.resolveConfig(registration.settings.config);
        const resultConfig = runtimeConfig ? this._mergeConfigs(resolvedConfig, runtimeConfig) : resolvedConfig;
        instance.config = resultConfig;
    }
    _getCachedInstances(registration, injectionArgs, config) {
        const key = registration.settings.key;
        const resolver = this._getResolver(registration);
        if (!this.instances) {
            this.instances = {};
        }
        const allInstances = this.instances[key];
        if (!allInstances) {
            return [];
        }
        const configHash = resolver.hashConfig(config);
        const configInstances = allInstances[configHash];
        if (!configInstances) {
            return [];
        }
        const injectionArgsHash = resolver.hash(injectionArgs);
        const argumentInstances = configInstances[injectionArgsHash];
        if (!argumentInstances) {
            return [];
        }
        return argumentInstances.map((wrapper) => {
            return wrapper.instance;
        });
    }
    _createInstanceId() {
        return uuid.v4();
    }
    _cacheInstance(registration, resolutionContext, instance, injectionArgs, config) {
        const key = registration.settings.key;
        if (!resolutionContext.instanceLookup) {
            resolutionContext.instanceLookup = {};
        }
        resolutionContext.currentResolution.instance = instance;
        resolutionContext.instanceLookup[resolutionContext.currentResolution.id] = resolutionContext.currentResolution;
        resolutionContext.instanceResolutionOrder.push(resolutionContext.currentResolution.id);
        if (!resolutionContext.currentResolution.ownedBy) {
            return;
        }
        const resolver = this._getResolver(registration);
        if (!this.instances) {
            this.instances = {};
        }
        let allInstances = this.instances[key];
        if (!allInstances) {
            allInstances = this.instances[key] = {};
        }
        const configHash = resolver.hashConfig(config);
        let configInstances = allInstances[configHash];
        if (!configInstances) {
            configInstances = allInstances[configHash] = {};
        }
        const injectionArgsHash = resolver.hash(injectionArgs);
        let argumentInstances = configInstances[injectionArgsHash];
        if (!argumentInstances) {
            argumentInstances = configInstances[injectionArgsHash] = [];
        }
        argumentInstances.push(instance);
    }
    validateDependencies(...keys) {
        const validationKeys = keys.length > 0 ? keys : this.getRegistrationKeys();
        const errors = this._validateDependencies(validationKeys);
        if (errors.length > 0) {
            console.log('------------------');
            console.log(errors);
            console.log('------------------');
            throw new Error('fuck');
        }
        return errors;
    }
    _validateDependencies(keys, history = []) {
        const errors = [];
        keys.forEach((key) => {
            const registration = this.getRegistration(key);
            if (history.indexOf(registration) > 0) {
                const errorMessage = `circular dependency on key '${registration.settings.key}' detected.`;
                const validationError = this._createValidationError(registration, history, errorMessage);
                errors.push(validationError);
                return;
            }
            history.push(registration);
            if (!registration.settings.dependencies) {
                return;
            }
            for (const dependencyKey of registration.settings.dependencies) {
                const dependency = this.getRegistration(dependencyKey);
                const deepErrors = this._validateDependency(registration, dependency, history);
                Array.prototype.push.apply(errors, deepErrors);
            }
        });
        return errors;
    }
    _validateDependency(registration, dependency, history) {
        const newRegistrationHistory = [];
        Array.prototype.push.apply(newRegistrationHistory, history);
        const errors = [];
        const dependencyKey = dependency.settings.key;
        const dependencyKeyOverwritten = this._getDependencyKeyOverwritten(registration, dependency.settings.key);
        if (!dependency) {
            let errorMessage;
            if (dependencyKey === dependencyKeyOverwritten) {
                errorMessage = `dependency '${dependencyKey}' overwritten with key '${dependencyKeyOverwritten}' declared on '${registration.settings.key}' is missing.`;
            }
            else {
                errorMessage = `dependency '${dependencyKeyOverwritten}' declared on '${registration.settings.key}' is missing.`;
            }
            const validationError = this._createValidationError(registration, newRegistrationHistory, errorMessage);
            errors.push(validationError);
        }
        else if (dependency.settings.dependencies) {
            const overwrittenKeyValidationErrors = this._validateOverwrittenKeys(registration, newRegistrationHistory);
            Array.prototype.push.apply(errors, overwrittenKeyValidationErrors);
            const circularBreakFound = this._historyHasCircularBreak(newRegistrationHistory, dependency);
            if (!circularBreakFound) {
                const deepErrors = this._validateDependencies([dependency.settings.key], newRegistrationHistory);
                Array.prototype.push.apply(errors, deepErrors);
            }
        }
        return errors;
    }
    _historyHasCircularBreak(history, dependency) {
        return history.some((parentRegistration) => {
            const parentSettings = parentRegistration.settings;
            if (this.settings.circularDependencyCanIncludeSingleton && parentSettings.isSingleton) {
                return true;
            }
            if (this.settings.circularDependencyCanIncludeLazy && parentSettings.wantsLazyInjection && parentSettings.lazyDependencies.length > 0) {
                if (parentSettings.wantsLazyInjection ||
                    parentSettings.lazyDependencies.indexOf(dependency.settings.key) >= 0) {
                    return true;
                }
                if (parentSettings.wantsPromiseLazyInjection ||
                    parentSettings.lazyPromiseDependencies.indexOf(dependency.settings.key) >= 0) {
                    return true;
                }
            }
        });
    }
    _createValidationError(registration, history, errorMessage) {
        const validationError = {
            registrationStack: history,
            currentRegistration: registration,
            errorMessage: errorMessage
        };
        return validationError;
    }
    _validateOverwrittenKeys(registration, history) {
        const overwrittenKeys = Object.keys(registration.settings.overwrittenKeys);
        const errors = [];
        overwrittenKeys.forEach((overwrittenKey) => {
            const keyErrors = this._validateOverwrittenKey(registration, overwrittenKey, history);
            Array.prototype.push.apply(errors, keyErrors);
        });
        return errors;
    }
    _validateOverwrittenKey(registration, overwrittenKey, history) {
        const errors = [];
        if (registration.settings.dependencies.indexOf(overwrittenKey) < 0) {
            const errorMessage = `No dependency for overwritten key '${overwrittenKey}' has been declared on registration for key '${registration.settings.key}'.`;
            const validationError = this._createValidationError(registration, history, errorMessage);
            errors.push(validationError);
        }
        const overwrittenKeyValue = registration.settings.overwrittenKeys[overwrittenKey];
        const overwrittenKeyRegistration = this.getRegistration(overwrittenKeyValue);
        if (!overwrittenKeyRegistration) {
            const errorMessage = `Registration for overwritten key '${overwrittenKey}' declared on registration for key '${registration.settings.key}' is missing.`;
            const validationError = this._createValidationError(registration, history, errorMessage);
            errors.push(validationError);
        }
        return errors;
    }
    _mergeArguments(existingArgs = [], newArgs = []) {
        const finalArgs = [];
        Array.prototype.push.apply(finalArgs, existingArgs);
        Array.prototype.push.apply(finalArgs, newArgs);
        return finalArgs;
    }
    _mergeConfigs(existingConfig, newConfig) {
        if (!existingConfig) {
            return newConfig;
        }
        if (!newConfig) {
            return existingConfig;
        }
        return __assign({}, existingConfig, newConfig);
    }
    _mergeRegistrationConfig(registration, config) {
        const registrationConfig = this._resolveConfig(registration, registration.settings.config);
        const runtimeConfig = this._resolveConfig(registration, config);
        const configUsed = this._mergeConfigs(registrationConfig, runtimeConfig);
        return configUsed;
    }
    _resolveConfig(registration, config) {
        const resolver = this._getResolver(registration);
        return resolver.resolveConfig(config);
    }
    _createChildResolutionContext(registration, resolutionContext) {
        const newResolutionContext = this._cloneResolutionContext(resolutionContext);
        const id = this._createInstanceId();
        newResolutionContext.currentResolution = {
            id: id,
        };
        resolutionContext.instanceLookup[id] = newResolutionContext.currentResolution;
        const ownedDependencies = registration.settings.ownedDependencies || [];
        return newResolutionContext;
    }
    _cloneResolutionContext(resolutionContext) {
        return Object.assign({}, resolutionContext);
    }
    _isDependencyLazy(registration, dependencyKey) {
        if (!registration.settings.wantsLazyInjection) {
            return false;
        }
        return registration.settings.lazyDependencies.length === 0 || registration.settings.lazyDependencies.indexOf(dependencyKey) >= 0;
    }
    _isDependencyLazyAsync(registration, dependencyKey) {
        if (!registration.settings.wantsPromiseLazyInjection) {
            return false;
        }
        return registration.settings.lazyPromiseDependencies.length === 0 || registration.settings.lazyPromiseDependencies.indexOf(dependencyKey) >= 0;
    }
    _isDependencyOwned(registration, dependencyKey) {
        if (!registration.settings.ownedDependencies) {
            return false;
        }
        return registration.settings.ownedDependencies.length !== 0 && registration.settings.ownedDependencies.indexOf(dependencyKey) >= 0;
    }
    _getDependencyKeyOverwritten(registration, dependencyKey) {
        let finalDependencyKey = dependencyKey;
        if (registration.settings.overwrittenKeys[dependencyKey]) {
            finalDependencyKey = registration.settings.overwrittenKeys[dependencyKey];
        }
        return finalDependencyKey;
    }
}
exports.Container = Container;

//# sourceMappingURL=container.js.map
