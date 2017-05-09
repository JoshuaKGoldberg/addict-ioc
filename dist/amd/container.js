var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./registry", "./resolution_context", "./default_settings", "./utils", "object-hash", "deepmerge"], function (require, exports, registry_1, resolution_context_1, default_settings_1, utils_1, hash, merge) {
    "use strict";
    var hashOptions = {
        respectFunctionProperties: false,
        respectType: true,
        unorderedArrays: true
    };
    var Container = (function (_super) {
        __extends(Container, _super);
        function Container(parentContainer, settings) {
            if (settings === void 0) { settings = default_settings_1.DefaultSettings; }
            var _this = _super.call(this, settings) || this;
            _this.parentContainer = parentContainer;
            _this.settings = settings;
            _this.initialize();
            return _this;
        }
        Container.prototype.clear = function () {
            _super.prototype.clear.call(this);
            this.initialize();
        };
        Container.prototype.initialize = function () {
            this.instances = new Map();
            this.registerObject(this.settings.containerRegistrationKey, this);
        };
        Container.prototype.resolve = function (key, injectionArgs, config) {
            if (injectionArgs === void 0) { injectionArgs = []; }
            var registration = _super.prototype.getRegistration.call(this, key);
            var resolutionContext = new resolution_context_1.ResolutionContext(registration);
            return this._resolve(registration, resolutionContext, injectionArgs, config);
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
            return merge(existingConfig, newConfig);
        };
        Container.prototype._resolve = function (registration, resolutionContext, injectionArgs, config) {
            if (injectionArgs === void 0) { injectionArgs = []; }
            return this._resolveInstance(registration, resolutionContext, injectionArgs, config);
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
        Container.prototype._resolveConfig = function (registration, config) {
            var resolver = this._getResolver(registration);
            return resolver.resolveConfig(config);
        };
        Container.prototype._resolveInstance = function (registration, resolutionContext, injectionArgs, config) {
            var registrationConfig = this._resolveConfig(registration, registration.settings.config);
            var runtimeConfig = this._resolveConfig(registration, config);
            var configUsed = this._mergeConfigs(registrationConfig, runtimeConfig);
            if (registration.settings.isSingleton) {
                return this._getInstance(registration, resolutionContext, injectionArgs, configUsed);
            }
            return this._getNewInstance(registration, resolutionContext, injectionArgs, configUsed);
        };
        Container.prototype._getInstance = function (registration, resolutionContext, injectionArgs, config) {
            if (injectionArgs === void 0) { injectionArgs = []; }
            var instances = this._getCachedInstances(registration, injectionArgs, config);
            if (instances.length === 0) {
                return this._getNewInstance(registration, resolutionContext, injectionArgs, config);
            }
            return instances[0];
        };
        Container.prototype._getNewInstance = function (registration, resolutionContext, injectionArgs, config) {
            if (injectionArgs === void 0) { injectionArgs = []; }
            this._validateResolutionContext(resolutionContext);
            var dependencies = this._resolveDependencies(registration, resolutionContext);
            var instance = this._createInstance(registration, dependencies, injectionArgs);
            this._configureInstance(instance, config);
            this._cacheInstance(registration, instance, injectionArgs, config);
            return instance;
        };
        Container.prototype._getNewInstanceResolutionContext = function (registration, resolutionContext) {
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
        Container.prototype._validateResolutionContext = function (resolutionContext) {
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
        Container.prototype._resolveDependency = function (registration, dependencyKey, resolutionContext) {
            var newResolutionContext = this._getNewInstanceResolutionContext(registration, resolutionContext);
            var dependencyRegistration = _super.prototype.getRegistration.call(this, dependencyKey);
            var isDependencyLazy = this._isDependencyLazy(registration, dependencyKey);
            if (isDependencyLazy) {
                return this._resolveLazy(dependencyRegistration, newResolutionContext, undefined, undefined);
            }
            return this._resolveInstance(dependencyRegistration, newResolutionContext, undefined, undefined);
        };
        Container.prototype._isDependencyLazy = function (registration, dependencyKey) {
            if (!registration.settings.lazyDependencies) {
                return false;
            }
            return registration.settings.lazyDependencies.length === 0 || registration.settings.lazyDependencies.indexOf(dependencyKey) >= 0;
        };
        Container.prototype._createInstance = function (registration, dependencies, injectionArgs) {
            var resolver = this._getResolver(registration);
            var type = resolver.resolveType(this, registration);
            var instance = resolver.createInstance(this, registration, dependencies, injectionArgs);
            return instance;
        };
        Container.prototype._getResolver = function (registration) {
            return registration.settings.resolver || this.settings.resolver;
            ;
        };
        Container.prototype._configureInstance = function (instance, config) {
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
        Container.prototype._getCachedInstances = function (registration, injectionArgs, config) {
            var key = registration.settings.key;
            if (!this.instances) {
                this.instances = new Map();
            }
            var allInstances = this.instances.get(key);
            if (!allInstances) {
                return [];
            }
            var configHash = this._hashConfig(config);
            var configInstances = allInstances.get(configHash);
            if (!configInstances) {
                return [];
            }
            var injectionArgsHash = this._hashInjectionArgs(injectionArgs);
            var argumentInstances = configInstances.get(injectionArgsHash);
            if (!argumentInstances) {
                return [];
            }
            return argumentInstances;
        };
        Container.prototype._cacheInstance = function (registration, instance, injectionArgs, config) {
            var key = registration.settings.key;
            if (!this.instances) {
                this.instances = new Map();
            }
            var allInstances = this.instances.get(key);
            if (!allInstances) {
                allInstances = new Map();
                this.instances.set(key, allInstances);
            }
            var configHash = this._hashConfig(config);
            var configInstances = allInstances.get(configHash);
            if (!configInstances) {
                configInstances = new Map();
                allInstances.set(configHash, configInstances);
            }
            var injectionArgsHash = this._hashInjectionArgs(injectionArgs);
            var argumentInstances = configInstances.get(injectionArgsHash);
            if (!argumentInstances) {
                argumentInstances = [];
                configInstances.set(injectionArgsHash, argumentInstances);
            }
            argumentInstances.push(instance);
        };
        Container.prototype._hashConfig = function (config) {
            return this._hashObject(config);
        };
        Container.prototype._hashInjectionArgs = function (injectionArgs) {
            return this._hashObject(injectionArgs);
        };
        Container.prototype._hashObject = function (object) {
            if (typeof object === 'undefined') {
                return undefined;
            }
            return hash(object, hashOptions);
        };
        return Container;
    }(registry_1.Registry));
    exports.Container = Container;
});

//# sourceMappingURL=container.js.map
