System.register(["./utils"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var utils_1, Resolver;
    return {
        setters: [
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }
        ],
        execute: function () {
            Resolver = (function () {
                function Resolver() {
                }
                Resolver.prototype.resolveType = function (container, registration) {
                    return registration.settings.type;
                };
                Resolver.prototype.resolveConfig = function (config) {
                    return config;
                };
                Resolver.prototype._configureInstance = function (instance, config) {
                    if (!config) {
                        return;
                    }
                    var configPropertyDescriptor = utils_1.getPropertyDescriptor(instance, 'config');
                    if (configPropertyDescriptor === undefined || (!configPropertyDescriptor.writable && !configPropertyDescriptor.set)) {
                        var instancePrototype = Object.getPrototypeOf(instance);
                        throw new Error("The setter for the config property on type '" + instancePrototype.constructor.name + "' is missing.");
                    }
                    instance.config = config;
                };
                Resolver.prototype.createInstance = function (container, registration, dependencies, injectionArgs) {
                    return this._createInstance(registration, dependencies, injectionArgs);
                };
                Resolver.prototype._createInstance = function (registration, dependencies, injectionArgs) {
                    var instance;
                    var type = registration.settings.type;
                    var argumentsToBeInjected = dependencies.concat(injectionArgs);
                    if (typeof type !== 'function') {
                        instance = type;
                        if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
                            this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
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
                            this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
                        }
                    }
                    return instance;
                };
                Resolver.prototype._createInstanceByFactory = function (type) {
                    var instance = type();
                    return instance;
                };
                Resolver.prototype._createInstanceByFactoryWithInjection = function (type, argumentsToBeInjected) {
                    var instance = type.apply(undefined, argumentsToBeInjected);
                    return instance;
                };
                Resolver.prototype._createInstanceByConstructor = function (type) {
                    var instance = new type();
                    return instance;
                };
                Resolver.prototype._createInstanceByConstructorWithInjection = function (type, argumentsToBeInjected) {
                    var instance = new (type.bind.apply(type, [void 0].concat(argumentsToBeInjected)))();
                    return instance;
                };
                Resolver.prototype._injectDependenciesIntoInstance = function (registrationSettings, instance, argumentsToBeInjected) {
                    var propertySource;
                    if (registrationSettings.isFactory) {
                        propertySource = instance;
                    }
                    else {
                        propertySource = Object.getPrototypeOf(instance);
                    }
                    var injectionTargetPropertyDescriptor = utils_1.getPropertyDescriptor(propertySource, registrationSettings.injectInto);
                    if (injectionTargetPropertyDescriptor) {
                        if (typeof injectionTargetPropertyDescriptor.value === 'function') {
                            this._injectDependenciesIntoFunction(instance, injectionTargetPropertyDescriptor.value, argumentsToBeInjected);
                        }
                        else if (injectionTargetPropertyDescriptor.set) {
                            this._injectDependenciesIntoProperty(instance, registrationSettings.injectInto, argumentsToBeInjected);
                        }
                        else {
                            throw new Error("The setter for the '" + registrationSettings.injectInto + "' property on type '" + Object.getPrototypeOf(instance).constructor.name + "' is missing.");
                        }
                    }
                    else {
                        throw new Error("The injection target '" + registrationSettings.injectInto + "' on type '" + Object.getPrototypeOf(instance).constructor.name + "' is missing.");
                    }
                };
                Resolver.prototype._injectDependenciesIntoFunction = function (instance, targetFunction, argumentsToBeInjected) {
                    targetFunction.apply(targetFunction, argumentsToBeInjected);
                };
                Resolver.prototype._injectDependenciesIntoProperty = function (instance, property, argumentsToBeInjected) {
                    instance[property] = argumentsToBeInjected;
                };
                return Resolver;
            }());
            exports_1("Resolver", Resolver);
        }
    };
});

//# sourceMappingURL=resolver.js.map
