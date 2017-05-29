"use strict";
const utils_1 = require("./utils");
class Resolver {
    hash(anything) {
        return anything;
    }
    hashType(type) {
        return this.hash(type);
    }
    hashObject(object) {
        return this.hash(object);
    }
    hashFactory(factory) {
        return this.hash(factory);
    }
    hashConfig(config) {
        return this.hash(config);
    }
    resolveType(container, registration) {
        return registration.settings.type;
    }
    async resolveTypeAsync(container, registration) {
        return new Promise((resolve, reject) => {
            resolve(registration.settings.type);
        });
    }
    resolveObject(container, registration) {
        return registration.settings.object;
    }
    async resolveObjectAsync(container, registration) {
        return new Promise((resolve, reject) => {
            resolve(registration.settings.object);
        });
    }
    resolveFactory(container, registration) {
        return registration.settings.factory;
    }
    async resolveFactoryAsync(container, registration) {
        return new Promise((resolve, reject) => {
            resolve(registration.settings.factory);
        });
    }
    resolveConfig(config) {
        return config;
    }
    _configureInstance(instance, config) {
        if (!config) {
            return;
        }
        const configPropertyDescriptor = utils_1.getPropertyDescriptor(instance, 'config');
        if (configPropertyDescriptor === undefined || (!configPropertyDescriptor.writable && !configPropertyDescriptor.set)) {
            const instancePrototype = Object.getPrototypeOf(instance);
            throw new Error(`The setter for the config property on type '${instancePrototype.constructor.name}' is missing.`);
        }
        instance.config = config;
    }
    createObject(container, object, registration, dependencies, injectionArgs) {
        return this._createObject(object, registration, dependencies, injectionArgs);
    }
    _createObject(object, registration, dependencies, injectionArgs) {
        const argumentsToBeInjected = dependencies.concat(injectionArgs);
        if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
            this._injectDependenciesIntoInstance(registration.settings, object, argumentsToBeInjected);
        }
        return object;
    }
    createFactory(container, type, registration, dependencies, injectionArgs) {
        return this._createFactory(registration, dependencies, injectionArgs);
    }
    _createFactory(registration, dependencies, injectionArgs) {
        const argumentsToBeInjected = dependencies.concat(injectionArgs);
        if (registration.settings.wantsInjection && !registration.settings.injectInto && injectionArgs.length > 0) {
            return this._createInstanceByFactoryWithInjection(registration.settings.factory, argumentsToBeInjected);
        }
        const instance = this._createInstanceByFactory(registration.settings.factory);
        if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
            this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
        }
        return instance;
    }
    createInstance(container, type, registration, dependencies, injectionArgs) {
        return this._createInstance(type, registration, dependencies, injectionArgs);
    }
    _createInstance(type, registration, dependencies, injectionArgs) {
        const argumentsToBeInjected = dependencies.concat(injectionArgs);
        if (registration.settings.wantsInjection && !registration.settings.injectInto && argumentsToBeInjected.length > 0) {
            return this._createInstanceByConstructorWithInjection(type, argumentsToBeInjected);
        }
        const instance = this._createInstanceByConstructor(type);
        if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
            this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
        }
        return instance;
    }
    _createInstanceByFactory(factoryFunction) {
        const instance = factoryFunction();
        return instance;
    }
    _createInstanceByFactoryWithInjection(factoryFunction, argumentsToBeInjected) {
        const instance = factoryFunction.apply(undefined, argumentsToBeInjected);
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
    _injectDependenciesIntoInstance(registrationSettings, instance, argumentsToBeInjected) {
        let propertySource;
        if (registrationSettings.isFactory) {
            propertySource = instance;
        }
        else {
            propertySource = Object.getPrototypeOf(instance);
        }
        const injectionTargetPropertyDescriptor = utils_1.getPropertyDescriptor(propertySource, registrationSettings.injectInto);
        if (injectionTargetPropertyDescriptor) {
            if (typeof injectionTargetPropertyDescriptor.value === 'function') {
                this._injectDependenciesIntoFunction(instance, injectionTargetPropertyDescriptor.value, argumentsToBeInjected);
            }
            else if (injectionTargetPropertyDescriptor.set) {
                this._injectDependenciesIntoProperty(instance, registrationSettings.injectInto, argumentsToBeInjected);
            }
            else {
                throw new Error(`The setter for the '${registrationSettings.injectInto}' property on type '${Object.getPrototypeOf(instance).constructor.name}' is missing.`);
            }
        }
        else {
            throw new Error(`The injection target '${registrationSettings.injectInto}' on type '${Object.getPrototypeOf(instance).constructor.name}' is missing.`);
        }
    }
    _injectDependenciesIntoFunction(instance, targetFunction, argumentsToBeInjected) {
        targetFunction.apply(targetFunction, argumentsToBeInjected);
    }
    _injectDependenciesIntoProperty(instance, property, argumentsToBeInjected) {
        instance[property] = argumentsToBeInjected;
    }
}
exports.Resolver = Resolver;

//# sourceMappingURL=resolver.js.map
