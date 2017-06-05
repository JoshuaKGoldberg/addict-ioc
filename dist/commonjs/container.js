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
        super(settings, parentRegistry);
        this.instances = {};
        this.parentContainer = parentContainer;
        this.settings = Object.assign(Object.assign({}, default_settings_1.DefaultSettings), settings);
        this.initialize();
    }
    initialize() {
        super.initialize();
        this.instances = {};
        this.settings = this._mergeSettings(default_settings_1.DefaultSettings, this.settings);
        this.registerObject(this.settings.containerRegistrationKey, this);
    }
    clear() {
        super.clear();
        this.initialize();
    }
    _orderDependencies(registration, results, nest = []) {
        for (let dependencyKey of registration.settings.dependencies) {
            if (results.order.indexOf(dependencyKey) !== -1) {
                return;
            }
            const dependency = this.getRegistration(dependencyKey);
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
    }
    validateDependencies(...keys) {
        const validationKeys = keys.length > 0 ? keys : this.getRegistrationKeys();
        const errors = [];
        for (const key of validationKeys) {
            const registration = this.getRegistration(key);
            const results = {
                order: [],
                missing: [],
                recursive: [],
            };
            errors.concat(this._valDependencies(registration, results));
            if (results.missing.length > 0) {
                for (const miss of results.missing) {
                    errors.push(`registration for key "${miss}" is missing`);
                }
            }
            if (results.recursive.length > 0) {
                for (const recurs of results.recursive) {
                    errors.push(`recursive dependency detected: ` + recurs.join(' -> '));
                }
            }
            console.log('results');
            console.log(results);
        }
        if (errors.length > 0) {
            console.log('.................');
            console.log(errors);
            console.log('.................');
            throw new Error('validation failed');
        }
        return errors;
    }
    _valDependencies(registration, results, nest = []) {
        const errors = [];
        errors.concat(this._validateOverwrittenKeys(registration));
        for (let dependencyKey of registration.settings.dependencies) {
            dependencyKey = this._getDependencyKeyOverwritten(registration, dependencyKey);
            if (results.order.indexOf(dependencyKey) !== -1) {
                return;
            }
            const dependency = this.getRegistration(dependencyKey);
            if (!dependency) {
                results.missing.push(dependencyKey);
            }
            else if (nest.indexOf(dependency) > -1) {
                if (!this._historyHasCircularBreak(nest, dependency)) {
                    nest.push(dependency);
                    results.recursive.push(nest.slice(0).map(x => x.settings.key));
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
        for (const dependencyKey of dependencies) {
            const resolvedDependency = this._resolveDependency(registration, dependencyKey, resolutionContext);
            resolvedDependencies.push(resolvedDependency);
        }
        return resolvedDependencies;
    }
    async _resolveDependenciesAsync(registration, resolutionContext) {
        const resolvedDependencies = [];
        const dependencies = registration.settings.dependencies || [];
        for (const dependencyKey of dependencies) {
            const resolvedDependency = await this._resolveDependencyAsync(registration, dependencyKey, resolutionContext);
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
        return argumentInstances;
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
        resolutionContext.instanceResolutionOrder.push(resolutionContext.currentResolution.id);
        if (!registration.settings.isSingleton) {
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
    validateDependencies2(...keys) {
        const validationKeys = keys.length > 0 ? keys : this.getRegistrationKeys();
        const errors = this._validateDependencies(validationKeys);
        if (errors.length > 0) {
            console.log('.................');
            console.log(errors);
            console.log('.................');
            throw new Error('validation failed');
        }
        return errors;
    }
    _validateDependencies(keys, history = []) {
        const errors = [];
        for (const key of keys) {
            const registration = this.getRegistration(key);
            if (!registration) {
                errors.push(`registration for key '${key}' is missing.`);
                return;
            }
            if (history.indexOf(registration) > 0) {
                errors.push(`circular dependency on key '${registration.settings.key}' detected.`);
                return;
            }
            history.push(registration);
            if (!registration.settings.dependencies) {
                return;
            }
            for (const dependencyKey of registration.settings.dependencies) {
                const deepErrors = this._validateDependency(registration, dependencyKey, history);
                Array.prototype.push.apply(errors, deepErrors);
            }
        }
        return errors;
    }
    _validateDependency(registration, dependencyKey, history) {
        const newRegistrationHistory = [];
        Array.prototype.push.apply(newRegistrationHistory, history);
        const errors = [];
        const dependencyKeyOverwritten = this._getDependencyKeyOverwritten(registration, dependencyKey);
        const dependency = this.getRegistration(dependencyKeyOverwritten);
        if (!dependency) {
            errors.push(`dependency '${dependencyKeyOverwritten}' declared on '${registration.settings.key}' is missing.`);
        }
        else {
            const overwrittenKeyValidationErrors = this._validateOverwrittenKeys(dependency);
            Array.prototype.push.apply(errors, overwrittenKeyValidationErrors);
            if (dependency.settings.dependencies) {
                const circularBreakFound = this._historyHasCircularBreak(newRegistrationHistory, dependency);
                if (!circularBreakFound) {
                    const deepErrors = this._validateDependencies(dependency.settings.dependencies, newRegistrationHistory);
                    Array.prototype.push.apply(errors, deepErrors);
                }
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
            if (this.settings.circularDependencyCanIncludeLazy && parentSettings.wantsLazyInjection) {
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
    _validateOverwrittenKeys(registration) {
        const overwrittenKeys = Object.keys(registration.settings.overwrittenKeys);
        const errors = [];
        for (const overwrittenKey of overwrittenKeys) {
            const keyErrors = this._validateOverwrittenKey(registration, overwrittenKey);
            Array.prototype.push.apply(errors, keyErrors);
        }
        return errors;
    }
    _validateOverwrittenKey(registration, overwrittenKey) {
        const errors = [];
        if (registration.settings.dependencies.indexOf(overwrittenKey) < 0) {
            const errorMessage = `No dependency for overwritten key '${overwrittenKey}' has been declared on registration for key '${registration.settings.key}'.`;
            errors.push(errorMessage);
        }
        const overwrittenKeyValue = registration.settings.overwrittenKeys[overwrittenKey];
        const overwrittenKeyRegistration = this.getRegistration(overwrittenKeyValue);
        if (!overwrittenKeyRegistration) {
            const errorMessage = `Registration for overwritten key '${overwrittenKey}' declared on registration for key '${registration.settings.key}' is missing.`;
            errors.push(errorMessage);
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
