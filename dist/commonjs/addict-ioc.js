'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DependencyInjectionContainer = exports.TypeRegistration = exports.TypeRegistrationSettings = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.create = create;

var _path = require('path');

var path = _interopRequireWildcard(_path);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }



var TypeRegistrationSettings = exports.TypeRegistrationSettings = function () {
  function TypeRegistrationSettings(defaults, key, type, isFactory, isRequire) {
    

    this._defaults = defaults;
    this._key = key;
    this._type = type;
    this._subscriptions = {
      newInstance: []
    };
    this._isFactory = isFactory;
    this._isRequire = isRequire;
    this._functionsToBind = [];
    this._lazyKeys = [];
    this._tags = {};
    this._overwrittenKeys = {};
  }

  _createClass(TypeRegistrationSettings, [{
    key: 'defaults',
    get: function get() {
      return this._defaults;
    }
  }, {
    key: 'key',
    get: function get() {
      return this._key;
    },
    set: function set(value) {
      this._key = value;
    }
  }, {
    key: 'type',
    get: function get() {
      return this._type;
    }
  }, {
    key: 'isFactory',
    get: function get() {
      return typeof this._isFactory !== 'undefined' ? this._isFactory : false;
    }
  }, {
    key: 'dependencies',
    get: function get() {
      return this._dependencies;
    },
    set: function set(value) {
      this._dependencies = value;
    }
  }, {
    key: 'tags',
    get: function get() {
      return this._tags;
    },
    set: function set(value) {
      this._tags = value;
    }
  }, {
    key: 'subscriptions',
    get: function get() {
      return this._subscriptions;
    }
  }, {
    key: 'config',
    get: function get() {
      return this._config;
    },
    set: function set(value) {
      this._config = value;
    }
  }, {
    key: 'isSingleton',
    get: function get() {
      return typeof this._isSingleton !== 'undefined' ? this._isSingleton : this.defaults.isSingleton;
    },
    set: function set(value) {
      this._isSingleton = value;
    }
  }, {
    key: 'wantsInjection',
    get: function get() {
      return typeof this._wantsInjection !== 'undefined' ? this._wantsInjection : this.defaults.wantsInjection;
    },
    set: function set(value) {
      this._wantsInjection = value;
    }
  }, {
    key: 'injectInto',
    get: function get() {
      return this._injectInto;
    },
    set: function set(value) {
      this._injectInto = value;
    }
  }, {
    key: 'isLazy',
    get: function get() {
      return this._isLazy !== 'undefined' ? this._isLazy : this.defaults.isLazy;
    },
    set: function set(value) {
      this._isLazy = value;
    }
  }, {
    key: 'bindFunctions',
    get: function get() {
      return this._bindFunctions !== 'undefined' ? this._bindFunctions : this.defaults.bindFunctions;
    },
    set: function set(value) {
      this._bindFunctions = value;
    }
  }, {
    key: 'functionsToBind',
    get: function get() {
      return this._functionsToBind;
    }
  }, {
    key: 'lazyKeys',
    get: function get() {
      return this._lazyKeys;
    }
  }, {
    key: 'overwrittenKeys',
    get: function get() {
      return this._overwrittenKeys;
    }
  }, {
    key: 'autoCreateMissingSubscribers',
    get: function get() {
      return this._autoCreateMissingSubscribers ? this._autoCreateMissingSubscribers : this.defaults.autoCreateMissingSubscribers;
    },
    set: function set(value) {
      this._autoCreateMissingSubscribers = value;
    }
  }, {
    key: 'autoCreateMissingRegistrations',
    get: function get() {
      return this._autoCreateMissingRegistrations ? this._autoCreateMissingRegistrations : this.defaults.autoCreateMissingRegistrations;
    },
    set: function set(value) {
      this._autoCreateMissingRegistrations = value;
    }
  }, {
    key: 'isRequire',
    get: function get() {
      return typeof this._isRequire !== 'undefined' ? this._isRequire : false;
    },
    set: function set(value) {
      this._isRequire = value;
    }
  }]);

  return TypeRegistrationSettings;
}();

var TypeRegistration = exports.TypeRegistration = function () {
  function TypeRegistration(defaults, key, type, isFactory, isRequire) {
    

    this._settings = new TypeRegistrationSettings(defaults, key, type, isFactory, isRequire);
  }

  TypeRegistration.prototype.dependencies = function dependencies() {
    var _arguments = arguments;


    var resolvedDepedencyConfigurations = [];

    var argumentKeys = Object.keys(arguments);

    argumentKeys.forEach(function (argumentKey) {

      var currentDependencyConfiguration = _arguments[argumentKey];

      var dependencyType = typeof currentDependencyConfiguration === 'undefined' ? 'undefined' : _typeof(currentDependencyConfiguration);

      if (Array.isArray(currentDependencyConfiguration)) {

        Array.prototype.push.apply(resolvedDepedencyConfigurations, currentDependencyConfiguration);
      } else if (dependencyType === 'string' || dependencyType === 'function') {

        resolvedDepedencyConfigurations.push(currentDependencyConfiguration);
      } else {

        throw new Error('The type \'' + dependencyType + '\' of your dependencies declaration is not yet supported.\n                Supported types: \'Array\', \'String\', \'Function(Type)\'');
      }
    });

    this.settings.dependencies = resolvedDepedencyConfigurations;

    return this;
  };

  TypeRegistration.prototype.configure = function configure(config) {

    var configType = typeof config === 'undefined' ? 'undefined' : _typeof(config);

    if (configType !== 'function' && configType !== 'object' && configType !== 'string') {

      throw new Error('The type \'' + configType + '\' of your dependencies declaration is not yet supported.\n              Supported types: \'Function\', \'Object\'');
    }

    this.settings.config = config;

    return this;
  };

  TypeRegistration.prototype.singleton = function singleton(isSingleton) {

    this.settings.isSingleton = !!isSingleton ? isSingleton : true;

    return this;
  };

  TypeRegistration.prototype.noInjection = function noInjection(injectionDisabled) {

    if (this.settings.injectInto) {
      throw new Error('\'noInjection\' induces a conflict to the \'injectInto\' declaration.');
    }

    if (this.settings.isLazy) {
      throw new Error('\'noInjection\' induces a conflict to the \'injectLazy\' declaration.');
    }

    this.settings.wantsInjection = !!injectionDisabled ? !injectionDisabled : false;

    return this;
  };

  TypeRegistration.prototype.injectInto = function injectInto(targetFunction) {

    if (!this.settings.wantsInjection) {
      throw new Error('\'injectInto\' induces a conflict to the \'noInjection\' declaration.');
    }

    this.settings.injectInto = targetFunction;

    return this;
  };

  TypeRegistration.prototype.injectLazy = function injectLazy() {

    if (!this.settings.wantsInjection) {
      throw new Error('\'injectLazy\' induces a conflict to the \'noInjection\' declaration.');
    }

    this.settings.isLazy = true;

    if (arguments.length > 0) {

      Array.prototype.push.apply(this.settings.lazyKeys, arguments);
    }

    return this;
  };

  TypeRegistration.prototype.onNewInstance = function onNewInstance(key, targetFunction) {

    var subscription = {
      key: key,
      method: targetFunction
    };

    this.settings.subscriptions.newInstance.push(subscription);

    return this;
  };

  TypeRegistration.prototype.bindFunctions = function bindFunctions() {

    this.settings.bindFunctions = true;

    if (arguments.length > 0) {

      Array.prototype.push.apply(this.settings.functionsToBind, arguments);
    }

    return this;
  };

  TypeRegistration.prototype.tags = function tags(tagOrTags) {
    var _this = this;

    for (var argumentIndex = 0; argumentIndex < arguments.length; argumentIndex++) {

      var argument = arguments[argumentIndex];
      var argumentType = typeof argument === 'undefined' ? 'undefined' : _typeof(argument);

      if (Array.isArray(argument)) {

        argument.forEach(function (tag) {

          _this.settings.tags[tag] = {};
        });
      } else if (argumentType === 'string') {

        this.settings.tags[argument] = {};
      } else {

        throw new Error('The type \'' + argumentType + '\' of your tags declaration is not yet supported.\n                Supported types: \'Array\', \'String\'');
      }
    }

    return this;
  };

  TypeRegistration.prototype.setAttribute = function setAttribute(tag, value) {

    if (!tag) {
      throw new Error('You have to specify a tag for your attribute.');
    }

    this.settings.tags[tag] = value;

    return this;
  };

  TypeRegistration.prototype._hasTags = function _hasTags(tags) {

    var declaredTags = Object.keys(this.settings.tags);

    var isTagMissing = tags.some(function (tag) {

      if (declaredTags.indexOf(tag) < 0) {

        return true;
      }
    });

    return !isTagMissing;
  };

  TypeRegistration.prototype._hasAttributes = function _hasAttributes(attributes) {
    var _this2 = this;

    var attributeKeys = Object.keys(attributes);

    var attributeMissing = attributeKeys.some(function (attribute) {

      var attributeValue = _this2.settings.tags[attribute];

      if (attributeValue !== attributes[attribute]) {

        return true;
      }
    });

    return !attributeMissing;
  };

  TypeRegistration.prototype.overwrite = function overwrite(originalKey, overwrittenKey) {

    if (this.settings.dependencies.indexOf(originalKey) < 0) {
      throw new Error('there is no dependency declared for original key \'' + originalKey + '\'.');
    }

    this.settings.overwrittenKeys[originalKey] = overwrittenKey;

    return this;
  };

  _createClass(TypeRegistration, [{
    key: 'settings',
    get: function get() {
      return this._settings;
    },
    set: function set(value) {
      this._settings = value;
    }
  }]);

  return TypeRegistration;
}();

function create(options) {
  return new TypeRegistration(options.defaults, options.key, options.type, options.isFactory, options.isRequire);
}

var DependencyInjectionContainer = exports.DependencyInjectionContainer = function () {
  function DependencyInjectionContainer(config) {
    

    this._config = config;
    this._registrations = {};
    this._instances = {};

    this._initializeRegistrationDeclarations();
    this._initializeBaseRegistrations();
  }

  DependencyInjectionContainer.prototype.clear = function clear() {
    this._registrations = {};
    this._instances = {};

    this._initializeBaseRegistrations();
  };

  DependencyInjectionContainer.prototype.setRequire = function setRequire(rootPath) {
    if (rootPath) {
      var pathDiff = path.relative(__dirname, rootPath);
      this._config.requireRelativePath = pathDiff;
    }
  };

  DependencyInjectionContainer.prototype.setConfigProvider = function setConfigProvider(getConfigCallback) {

    if (typeof getConfigCallback === 'function' && getConfigCallback !== null) {

      this._externalConfigProvider = getConfigCallback;
    } else {

      throw new Error('Config provider must be a function.');
    }
  };

  DependencyInjectionContainer.prototype.setDefaults = function setDefaults(registrationDefaults) {
    var _this3 = this;

    if (registrationDefaults) {

      var defaultSettings = ['isSingleton', 'wantsInjection', 'isLazy', 'bindFunctions', 'autoCreateMissingSubscribers'];

      defaultSettings.forEach(function (defaultSetting) {

        var defaultSettingValue = registrationDefaults[defaultSetting];

        _this3._setDefault(defaultSetting, defaultSettingValue);
      });
    }
  };

  DependencyInjectionContainer.prototype._setDefault = function _setDefault(settingKey, value) {

    if (this._isValidBoolean(value)) {

      this._config.registrationDefaults[settingKey] = value;

      return true;
    }
    return false;
  };

  DependencyInjectionContainer.prototype._isValidBoolean = function _isValidBoolean(settingValue) {
    return typeof settingValue === 'boolean';
  };

  DependencyInjectionContainer.prototype.register = function register(key, type) {

    var keyType = typeof key === 'undefined' ? 'undefined' : _typeof(key);

    var currentRegistration = void 0;

    if (keyType === 'string') {

      currentRegistration = this._registerTypeByKey(key, type);
    } else {

      throw new Error('The key type \'' + key + '\' is not supported.');
    }

    this.registrations[key] = currentRegistration;

    return currentRegistration;
  };

  DependencyInjectionContainer.prototype.unregister = function unregister(key) {

    if (this.registrations[key]) {

      delete this.registrations[key];
    } else {

      throw new Error('The key \'' + key + '\' is not registered.');
    }
  };

  DependencyInjectionContainer.prototype._registerTypeByKey = function _registerTypeByKey(key, type) {

    if (!key) {
      throw new Error('No key specified for registration of type \'' + type + '\'');
    }

    if (!type) {
      throw new Error('No type specified for registration of key \'' + key + '\'');
    }

    return TypeRegistration.create({
      defaults: this.config.registrationDefaults,
      key: key,
      type: type
    });
  };

  DependencyInjectionContainer.prototype.registerFactory = function registerFactory(key, factoryMethod) {

    if (typeof key !== 'string') {
      throw new Error('No key specified for registration of factory function \'' + factoryMethod + '\'');
    }

    var currentRegistration = TypeRegistration.create({
      defaults: this.config.registrationDefaults,
      key: key,
      type: factoryMethod,
      isFactory: true
    });

    this.registrations[key] = currentRegistration;

    return currentRegistration;
  };

  DependencyInjectionContainer.prototype.registerObject = function registerObject(key, object) {

    var keyType = typeof key === 'undefined' ? 'undefined' : _typeof(key);

    var currentRegistration = void 0;

    if (keyType === 'string') {

      if (!key) {
        throw new Error('No key specified for registration of type \'' + keyType + '\'');
      }

      currentRegistration = new TypeRegistration(this.config.registrationDefaults, key, object);
    } else {

      throw new Error('The key type \'' + key + '\' is not supported.');
    }

    this.registrations[key] = currentRegistration;

    currentRegistration.settings.isObject = true;

    return currentRegistration;
  };

  DependencyInjectionContainer.prototype.require = function require(moduleName) {
    var _this4 = this;

    if (typeof moduleName !== 'string') {
      throw new Error('No module name specified for registration of require');
    }

    var currentRegistration = TypeRegistration.create({
      defaults: this.config.registrationDefaults,
      key: moduleName,
      type: moduleName,
      isRequire: true
    });

    this.registrations[moduleName] = currentRegistration;

    currentRegistration['as'] = function (key) {

      _this4.registrations[key] = _this4.registrations[moduleName];

      delete _this4.registrations[moduleName];

      currentRegistration.settings.key = key;
    };

    return currentRegistration;
  };

  DependencyInjectionContainer.prototype._initializeBaseRegistrations = function _initializeBaseRegistrations() {
    this.registerObject(this.config.injectContainerKey, this);
  };

  DependencyInjectionContainer.prototype._initializeRegistrationDeclarations = function _initializeRegistrationDeclarations() {
    var _this5 = this;

    var declarations = ['dependencies', 'configure', 'singleton', 'noInjection', 'injectInto', 'injectLazy', 'onNewInstance', 'bindFunctions'];

    declarations.forEach(function (declaration) {

      _this5[declaration] = function () {
        _this5._ensureRegistrationStarted(declaration);
      };
    });
  };

  DependencyInjectionContainer.prototype._ensureRegistrationStarted = function _ensureRegistrationStarted(declaration) {
    throw new Error('There is no registration present to use \'' + declaration + '\'.\n        You can start a registration by calling the \'register\' method.');
  };

  DependencyInjectionContainer.prototype._getRegistration = function _getRegistration(key) {

    var registration = this.registrations[key];

    if (registration) {
      return registration;
    }

    throw new Error('There is no registration created for key \'' + key + '\'.');
  };

  DependencyInjectionContainer.prototype.resolve = function resolve(key, injectionArgs, config) {
    return this._resolve(key, injectionArgs, config);
  };

  DependencyInjectionContainer.prototype._resolve = function _resolve(key, injectionArgs, config, resolvedKeyHistory, isLazy) {

    if (typeof injectionArgs !== 'undefined' && !Array.isArray(injectionArgs)) {
      throw new Error('Injection args must be of type \'Array\'.');
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

  DependencyInjectionContainer.prototype._resolveInstance = function _resolveInstance(registration, injectionArgs, config, resolvedKeyHistory, isLazy) {
    var _this6 = this;

    if (Array.isArray(resolvedKeyHistory) && resolvedKeyHistory.indexOf(registration.settings.key) >= 0) {
      throw new Error('Circular dependency on key \'' + registration.settings.key + '\' detected.');
    }

    var resolvedRegistrationConfig = this._getConfig(registration.settings.key);

    var resolvedRuntimeConfig = this._resolveConfig(registration.settings.key, config);

    var configUsed = this._mergeConfig(resolvedRegistrationConfig, resolvedRuntimeConfig);

    if (registration.settings.isSingleton) {

      return this._getInstance(registration, injectionArgs, configUsed);
    }

    if (isLazy) {
      return function (lazyInjectionArgs, lazyConfig) {

        var injectionArgsUsed = _this6._mergeArguments(injectionArgs, lazyInjectionArgs);

        var lazyConfigUsed = _this6._mergeConfig(configUsed, lazyConfig);

        return _this6._getNewInstance(registration, injectionArgsUsed, lazyConfigUsed, resolvedKeyHistory);
      };
    }

    return this._getNewInstance(registration, injectionArgs, configUsed, resolvedKeyHistory);
  };

  DependencyInjectionContainer.prototype._mergeArguments = function _mergeArguments(baseArgs, additionalArgs) {

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

  DependencyInjectionContainer.prototype._mergeConfig = function _mergeConfig(baseConfig, additionalConfig) {
    var configUsed = baseConfig || undefined;

    if (!configUsed) {
      return additionalConfig;
    }

    var finalConfig = Object.assign(configUsed, additionalConfig);

    return finalConfig;
  };

  DependencyInjectionContainer.prototype._getInstance = function _getInstance(registration, injectionArgs, config) {

    var instances = this.instances[registration.settings.key];
    var instance = null;

    if (typeof instances === 'undefined') {

      return this._getNewInstance(registration, injectionArgs, config);
    }

    instances = this.instances[registration.settings.key][config][injectionArgs];

    if (Array.isArray(instances)) {

      if (instances.length === 0) {

        return this._getNewInstance(registration, injectionArgs, config);
      } else {

        instance = instances[0];
      }
    }

    return instance;
  };

  DependencyInjectionContainer.prototype._getKeysForInstanceConfigurationsByKey = function _getKeysForInstanceConfigurationsByKey(key) {

    var instance = this.instances[key];

    if (!instance) {
      return null;
    }

    return Object.keys(instance);
  };

  DependencyInjectionContainer.prototype._getKeysForInstanceInjectionArgumentsByKeyAndConfig = function _getKeysForInstanceInjectionArgumentsByKeyAndConfig(key, config) {

    var instance = this.instances[key][config];

    if (!instance) {
      return null;
    }

    return Object.keys(instance);
  };

  DependencyInjectionContainer.prototype._getAllInstances = function _getAllInstances(key, config, injectionArgs) {
    var _this7 = this;

    var configKeys = [];

    if (config) {

      configKeys.push(config);
    } else {

      Array.prototype.push.apply(configKeys, this._getKeysForInstanceConfigurationsByKey(key));
    }

    if (configKeys.length === 0) {

      return null;
    }

    var allInstances = [];

    configKeys.forEach(function (configKey) {

      var instanceInjectionArgumentKeys = _this7._getKeysForInstanceInjectionArgumentsByKeyAndConfig(key, config);

      if (!instanceInjectionArgumentKeys) {
        return;
      }

      instanceInjectionArgumentKeys.forEach(function (instanceInjectionArgumentKey) {

        Array.prototype.push.apply(allInstances, _this7.instances[key][configKey][instanceInjectionArgumentKey]);
      });
    });

    return allInstances;
  };

  DependencyInjectionContainer.prototype._getNewInstance = function _getNewInstance(registration, injectionArgs, config, resolvedKeyHistory) {

    var dependencies = this._resolveDependencies(registration, resolvedKeyHistory);

    var instance = this._createInstance(registration, dependencies, injectionArgs);

    this._configureInstance(instance, config);

    this._callSubscribers(registration, 'newInstance', instance);

    this._bindFunctionsToInstance(registration, instance);

    this._cacheInstance(registration.settings.key, instance, injectionArgs, config);

    return instance;
  };

  DependencyInjectionContainer.prototype._bindFunctionsToInstance = function _bindFunctionsToInstance(registration, instance) {

    if (!registration.settings.bindFunctions) {
      return;
    }

    var instanceKeys = void 0;

    if (registration.settings.functionsToBind.length > 0) {

      instanceKeys = registration.settings.functionsToBind;
    } else {

      var instancePrototype = Object.getPrototypeOf(instance);

      instanceKeys = Object.getOwnPropertyNames(instancePrototype);
    }

    instanceKeys.forEach(function (instanceKey) {

      if (instanceKey === 'constructor') {
        return;
      }

      var keyType = _typeof(instance[instanceKey]);

      if (keyType === 'function') {

        var unboundKey = instance[instanceKey];

        instance[instanceKey] = unboundKey.bind(instance);
      }
    });
  };

  DependencyInjectionContainer.prototype.resolveDependencies = function resolveDependencies(key) {

    var registration = this._getRegistration(key);

    return this._resolveDependencies(registration);
  };

  DependencyInjectionContainer.prototype._resolveDependencies = function _resolveDependencies(registration, resolvedKeyHistory) {
    var _this8 = this;

    var resolvedDependencies = [];

    var configuredDependencies = registration.settings.dependencies;

    if (!configuredDependencies) {
      return resolvedDependencies;
    }

    var dependencies = void 0;
    var dependenciesType = typeof configuredDependencies === 'undefined' ? 'undefined' : _typeof(configuredDependencies);

    if (Array.isArray(registration.settings.dependencies)) {

      dependencies = configuredDependencies;
    } else if (dependenciesType === 'string') {

      dependencies = [configuredDependencies];
    } else {

      throw new Error('The type \'' + dependenciesType + '\' of your dependencies declaration is not yet supported.\n        Supported types: \'Array\', \'String\'');
    }

    if (!resolvedKeyHistory) {
      resolvedKeyHistory = [];
    }

    resolvedKeyHistory.push(registration.settings.key);

    dependencies.forEach(function (dependency) {

      var isLazy = _this8._isDependencyLazy(registration, dependency);

      var dependencyKey = _this8._getDependencyKeyOverwritten(registration, dependency);

      var dependencyInstance = _this8._resolve(dependencyKey, undefined, undefined, resolvedKeyHistory, isLazy);

      resolvedDependencies.push(dependencyInstance);
    });

    return resolvedDependencies;
  };

  DependencyInjectionContainer.prototype._isDependencyLazy = function _isDependencyLazy(registration, dependency) {

    var isLazy = registration.settings.isLazy && (registration.settings.lazyKeys.length === 0 || registration.settings.lazyKeys.indexOf(dependency) >= 0);

    return isLazy;
  };

  DependencyInjectionContainer.prototype._getDependencyKeyOverwritten = function _getDependencyKeyOverwritten(registration, dependency) {

    var dependencyKey = dependency;

    if (registration.settings.overwrittenKeys[dependency]) {

      dependencyKey = registration.settings.overwrittenKeys[dependency];
    }

    return dependencyKey;
  };

  DependencyInjectionContainer.prototype._createInstance = function _createInstance(registration, dependencies, injectionArgs) {

    var instance = void 0;

    var type = registration.settings.type;

    if (registration.settings.isRequire) {

      var relativeRequirePath = void 0;

      if (registration.settings.type.substr(0, 1) === '.') {

        relativeRequirePath = path.join(this.config.requireRelativePath, registration.settings.type);
      } else {

        relativeRequirePath = registration.settings.type;
      }

      type = require(relativeRequirePath);
    }

    var argumentsToBeInjected = dependencies.concat(injectionArgs);

    if (typeof type !== 'function') {

      instance = type;

      if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {

        this._injectDependenciesIntoInstance(registration, instance, argumentsToBeInjected);
      }
    } else if (registration.settings.wantsInjection && !registration.settings.injectInto && argumentsToBeInjected.length > 0) {

      if (registration.settings.isFactory) {

        instance = this._createInstanceByFactoryWithInjection(type, argumentsToBeInjected);
      } else {

        instance = this._createInstanceByConstructorWithInjection(type, argumentsToBeInjected);
      }
    } else {
      if (registration.settings.isFactory) {

        instance = this._createInstanceByFactory(type);
      } else {

        instance = this._createInstanceByConstructor(type);
      }

      if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {

        this._injectDependenciesIntoInstance(registration, instance, argumentsToBeInjected);
      }
    }

    return instance;
  };

  DependencyInjectionContainer.prototype._createInstanceByFactory = function _createInstanceByFactory(type) {
    var instance = type();
    return instance;
  };

  DependencyInjectionContainer.prototype._createInstanceByFactoryWithInjection = function _createInstanceByFactoryWithInjection(type, argumentsToBeInjected) {
    var instance = type.apply(undefined, argumentsToBeInjected);
    return instance;
  };

  DependencyInjectionContainer.prototype._createInstanceByConstructor = function _createInstanceByConstructor(type) {
    var instance = new type();
    return instance;
  };

  DependencyInjectionContainer.prototype._createInstanceByConstructorWithInjection = function _createInstanceByConstructorWithInjection(type, argumentsToBeInjected) {
    var instance = new (Function.prototype.bind.apply(type, [null].concat(argumentsToBeInjected)))();
    return instance;
  };

  DependencyInjectionContainer.prototype._injectDependenciesIntoInstance = function _injectDependenciesIntoInstance(registration, instance, argumentsToBeInjected) {

    var propertySource = void 0;

    if (registration.settings.isFactory) {

      propertySource = instance;
    } else {

      propertySource = Object.getPrototypeOf(instance);
    }

    var injectionTargetPropertyDescriptor = this._getPropertyDescriptor(propertySource, registration.settings.injectInto);

    if (injectionTargetPropertyDescriptor) {

      if (typeof injectionTargetPropertyDescriptor.value === 'function') {

        this._injectDependenciesIntoFunction(instance, injectionTargetPropertyDescriptor.value, argumentsToBeInjected);
      } else if (injectionTargetPropertyDescriptor.set) {

        this._injectDependenciesIntoProperty(instance, registration.settings.injectInto, argumentsToBeInjected);
      } else {
        throw new Error('The setter for the \'' + registration.settings.injectInto + '\' property on type \'' + Object.getPrototypeOf(instance).constructor.name + '\' is missing.');
      }
    } else {
      throw new Error('The injection target \'' + registration.settings.injectInto + '\' on type \'' + Object.getPrototypeOf(instance).constructor.name + '\' is missing.');
    }
  };

  DependencyInjectionContainer.prototype._getPropertyDescriptor = function _getPropertyDescriptor(type, key) {

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

  DependencyInjectionContainer.prototype._injectDependenciesIntoFunction = function _injectDependenciesIntoFunction(instance, targetFunction, argumentsToBeInjected) {
    targetFunction.apply(targetFunction, argumentsToBeInjected);
  };

  DependencyInjectionContainer.prototype._injectDependenciesIntoProperty = function _injectDependenciesIntoProperty(instance, property, argumentsToBeInjected) {
    instance[property] = argumentsToBeInjected;
  };

  DependencyInjectionContainer.prototype._getSubscriberRegistrations = function _getSubscriberRegistrations(key, subscriptionKey) {
    var _this9 = this;

    var subscribers = [];

    var registrationKeys = Object.keys(this.registrations);

    registrationKeys.forEach(function (registrationKey) {

      var registration = _this9.registrations[registrationKey];

      registration.settings.subscriptions[subscriptionKey].some(function (subscription) {

        if (subscription.key === key || subscription.key === '*') {

          subscribers.push(registration);
          return true;
        }
      });
    });

    return subscribers;
  };

  DependencyInjectionContainer.prototype._getSubscriptionFromRegistrationByKey = function _getSubscriptionFromRegistrationByKey(registration, subscriptionKey, key) {

    var resultSubscription = null;
    registration.settings.subscriptions[subscriptionKey].some(function (subscription) {

      if (subscription.key === key) {

        resultSubscription = subscription;
        return true;
      }
    });

    return resultSubscription;
  };

  DependencyInjectionContainer.prototype._callSubscribers = function _callSubscribers(registration, subscriptionKey, params) {
    var _this10 = this;

    var subscriberRegistrations = this._getSubscriberRegistrations(registration.settings.key, subscriptionKey);

    subscriberRegistrations.forEach(function (subscriberRegistration) {

      var subscribedInstances = _this10._getAllInstances(subscriberRegistration.settings.key);

      if (subscribedInstances === null) {

        var newInstance = _this10._createMissingSubscriber(subscriberRegistration);

        subscribedInstances = [newInstance];
      }

      subscribedInstances.forEach(function (subscribedInstance) {

        _this10._callSubscriber(registration, subscriptionKey, subscriberRegistration, subscribedInstance, params);
      });
    });
  };

  DependencyInjectionContainer.prototype._createMissingSubscriber = function _createMissingSubscriber(subscriberRegistration) {

    if (subscriberRegistration.settings.autoCreateMissingSubscribers) {

      return this._getNewInstance(subscriberRegistration);
    }

    throw new Error('There is no instance created for key \'' + subscriberRegistration.settings.key + '\'.');
  };

  DependencyInjectionContainer.prototype._callSubscriber = function _callSubscriber(subscribedRegistration, subscriptionKey, subscriberRegistration, subscribedInstance, params) {

    if (!Array.isArray(params)) {
      params = [params];
    }

    var methodSubscription = this._getSubscriptionFromRegistrationByKey(subscriberRegistration, subscriptionKey, subscribedRegistration.settings.key);

    var subscribedMethod = subscribedInstance[methodSubscription.method];

    subscribedMethod.apply(subscribedInstance, params);
  };

  DependencyInjectionContainer.prototype._configureInstance = function _configureInstance(instance, config) {

    if (!config) {
      return;
    }

    var configPropertyDescriptor = this._getPropertyDescriptor(instance, 'config');

    if (configPropertyDescriptor === undefined || !configPropertyDescriptor.set) {
      var instancePrototype = Object.getPrototypeOf(instance);

      throw new Error('The setter for the config property on type \'' + instancePrototype.constructor.name + '\' is missing.');
    }

    instance.config = config;
  };

  DependencyInjectionContainer.prototype._cacheInstance = function _cacheInstance(key, instance, injectionArgs, config) {

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

  DependencyInjectionContainer.prototype._getConfig = function _getConfig(key) {

    var config = this.registrations[key].settings.config;

    var resolvedConfig = this._resolveConfig(key, config);

    if (!resolvedConfig) {
      return undefined;
    }

    return resolvedConfig;
  };

  DependencyInjectionContainer.prototype._resolveConfig = function _resolveConfig(key, config) {

    var registration = this.registrations[key];

    var resolvedConfig = void 0;

    var configType = typeof config === 'undefined' ? 'undefined' : _typeof(config);

    if (configType === 'function') {
      resolvedConfig = config(key);

      if (!resolvedConfig) {
        throw new Error('The specified config function for registration key ' + registration.settings.key + ' returned undefined.');
      }
    } else if (configType === 'object') {
      resolvedConfig = config;

      if (!resolvedConfig) {
        throw new Error('The specified config for registration key ' + registration.settings.key + ' is undefined.');
      }
    } else if (configType === 'string') {

      if (typeof this.externalConfigProvider !== 'function' || this.externalConfigProvider === null) {
        throw new Error('The specified config for registration key ' + registration.settings.key + ' is null.');
      }

      resolvedConfig = this.externalConfigProvider(config, registration);

      if (!resolvedConfig) {
        throw new Error('The specified config for registration key ' + registration.settings.key + ' is null.');
      }
    } else {

      resolvedConfig = undefined;
    }

    return resolvedConfig;
  };

  DependencyInjectionContainer.prototype.validateDependencies = function validateDependencies(optionalKey) {

    var registrationKeys = void 0;

    if (Array.isArray(optionalKey)) {

      registrationKeys = optionalKey;
    } else if (typeof optionalKey !== 'undefined') {

      registrationKeys = [optionalKey];
    } else {

      registrationKeys = Object.keys(this.registrations);
    }

    var errors = this._validateDependencies(registrationKeys);

    if (errors.length > 0) {
      throw new Error('Errors during validation of dependencies:\n          ' + errors.toString());
    }
  };

  DependencyInjectionContainer.prototype._validateDependencies = function _validateDependencies(registrationKeys, parentRegistrationHistory) {
    var _this11 = this;

    var errors = [];

    registrationKeys.forEach(function (registrationKey) {

      var registration = _this11.registrations[registrationKey];
      var dependencies = registration.settings.dependencies;

      if (!parentRegistrationHistory) {

        parentRegistrationHistory = [];
      } else if (parentRegistrationHistory.indexOf(registration) >= 0) {

        errors.push('Circular dependency on key \'' + registrationKey + '\' detected.');
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
        var originalDependencyKeyRegistration = _this11.registrations[originalDependencyKey];

        var dependencyKeyOverwritten = _this11._getDependencyKeyOverwritten(registration, originalDependencyKey);

        if (!originalDependencyKeyRegistration) {

          errors.push('Registration for \'' + originalDependencyKey + '\' overwritten with \'' + dependencyKeyOverwritten + '\' declared on registered for key \'' + registration.settings.key + '\' is missing.');
        }

        var dependencyRegistration = _this11.registrations[dependencyKeyOverwritten];

        if (!dependencyRegistration) {

          if (originalDependencyKey !== dependencyKeyOverwritten) {

            errors.push('Dependency \'' + originalDependencyKey + '\' overwritten with key \'' + dependencyKeyOverwritten + '\' declared on \'' + registration.settings.key + '\' is missing.');
          } else {

            errors.push('Dependency \'' + dependencyKeyOverwritten + '\' declared on \'' + registration.settings.key + '\' is missing.');
          }
        } else if (dependencyRegistration.settings.dependencies) {

          var overwrittenKeyValidationErrors = _this11._validateOverwrittenKeys(registration);
          Array.prototype.push.apply(errors, overwrittenKeyValidationErrors);

          var circularBreakFound = _this11._historyHasCircularBreak(subParentRegistrationHistory, dependencyRegistration);

          if (!circularBreakFound) {
            var deepErrors = _this11._validateDependencies([dependencyRegistration.settings.key], subParentRegistrationHistory);

            if (deepErrors.length > 0) {

              errors.push('Inner dependency errors for dependency \'' + dependencyKeyOverwritten + '\':\n                  ' + deepErrors.toString());
            }
          }
        }
      }
    });

    return errors;
  };

  DependencyInjectionContainer.prototype._historyHasCircularBreak = function _historyHasCircularBreak(parentRegistrationHistory, dependencyRegistration) {
    var _this12 = this;

    return parentRegistrationHistory.some(function (parentRegistration) {

      var parentSettings = parentRegistration.settings;

      if (_this12.config.circularDependencyCanIncludeSingleton && parentSettings.isSingleton) {
        return true;
      }

      if (_this12.config.circularDependencyCanIncludeLazy && parentSettings.isLazy) {

        if (parentSettings.lazyKeys.length === 0 || parentSettings.lazyKeys.indexOf(dependencyRegistration.settings.key) >= 0) {

          return true;
        }
      }
    });
  };

  DependencyInjectionContainer.prototype._validateOverwrittenKeys = function _validateOverwrittenKeys(registration) {
    var _this13 = this;

    var overwrittenKeys = Object.keys(registration.settings.overwrittenKeys);

    var errors = [];

    overwrittenKeys.forEach(function (overwrittenKey) {

      _this13._validateOverwrittenKey(registration, overwrittenKey, errors);
    });

    return errors;
  };

  DependencyInjectionContainer.prototype._validateOverwrittenKey = function _validateOverwrittenKey(registration, overwrittenKey, errors) {

    if (registration.settings.dependencies.indexOf(overwrittenKey) < 0) {

      errors.push('No dependency for overwritten key \'' + overwrittenKey + '\' has been declared on registration for key \'' + registration.settings.key + '\'.');
    }

    var overwrittenKeyValue = registration.settings.overwrittenKeys[overwrittenKey];
    var overwrittenKeyRegistration = this._getRegistration(overwrittenKeyValue);

    if (!overwrittenKeyRegistration) {

      errors.push('Registration for overwritten key \'' + overwrittenKey + '\' declared on registration for key \'' + registration.settings.key + '\' is missing.');
    }
  };

  DependencyInjectionContainer.prototype._squashArgumentsToArray = function _squashArgumentsToArray(args) {

    var allArgs = [];

    args.forEach(function (arg) {
      if (Array.isArray(arg)) {

        Array.prototype.push.apply(allArgs, arg);
      } else if (typeof arg === 'string') {

        allArgs.push(arg);
      }
    });

    return allArgs;
  };

  DependencyInjectionContainer.prototype.getKeysByTags = function getKeysByTags() {
    var _this14 = this;

    var args = Array.prototype.slice.call(arguments);
    var allTags = this._squashArgumentsToArray(args);

    var foundKeys = [];

    var registrationKeys = Object.keys(this.registrations);

    registrationKeys.forEach(function (registrationKey) {

      var registration = _this14.registrations[registrationKey];

      if (registration._hasTags(allTags)) {

        foundKeys.push(registration.settings.key);
      }
    });

    return foundKeys;
  };

  DependencyInjectionContainer.prototype.getKeysByAttributes = function getKeysByAttributes(attributes) {
    var _this15 = this;

    var foundKeys = [];

    var attributeKeys = Object.keys(attributes);

    var registrationKeys = this.getKeysByTags(attributeKeys);

    registrationKeys.forEach(function (registrationKey) {

      var registration = _this15._getRegistration(registrationKey);

      var registrationHasAttributes = registration._hasAttributes(attributes);

      if (registrationHasAttributes) {

        foundKeys.push(registration.settings.key);
      }
    });

    return foundKeys;
  };

  DependencyInjectionContainer.prototype.isRegistered = function isRegistered(key) {

    var registrationKeys = Object.keys(this.registrations);

    var found = registrationKeys.some(function (registrationKey) {

      if (registrationKey == key) {

        return true;
      }
    });

    return found;
  };

  _createClass(DependencyInjectionContainer, [{
    key: 'config',
    get: function get() {
      return this._config;
    }
  }, {
    key: 'registrations',
    get: function get() {
      return this._registrations;
    }
  }, {
    key: 'instances',
    get: function get() {
      return this._instances;
    }
  }, {
    key: 'externalConfigProvider',
    get: function get() {
      return this._externalConfigProvider;
    }
  }]);

  return DependencyInjectionContainer;
}();