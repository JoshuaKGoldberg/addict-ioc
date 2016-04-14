'use strict';

const TypeRegistrationSettings = require('./registration_settings');

class TypeRegistration {

  constructor(defaults, key, type, isFactory) {
    this._settings = new TypeRegistrationSettings(defaults, key, type, isFactory);
  }

  get settings() {
    return this._settings;
  }

  set settings(value) {
    this._settings = value;
  }


  dependencies() {

    const resolvedDepedencyConfigurations = [];

    const argumentKeys = Object.keys(arguments);

    argumentKeys.forEach((argumentKey) => {

      const currentDependencyConfiguration = arguments[argumentKey];

      const dependencyType = typeof currentDependencyConfiguration;

      if (Array.isArray(currentDependencyConfiguration)) {

        Array.prototype.push.apply(resolvedDepedencyConfigurations, currentDependencyConfiguration);

      } else if (dependencyType === 'string' || dependencyType === 'function') {

        resolvedDepedencyConfigurations.push(currentDependencyConfiguration);

      } else {

        throw new Error(`The type '${dependencyType}' of your dependencies declaration is not yet supported.
                Supported types: 'Array', 'String', 'Function(Type)'`);
      }
    });

    this.settings.dependencies = resolvedDepedencyConfigurations;

    return this;
  }


  configure(config) {

    const configType = typeof config;

    if (configType === 'string') {

      throw new Error(`The type '${configType}' of your dependencies declaration is not yet supported.
              Supported types: 'Array', 'String', 'Function(Type)'`);
    }

    this.settings.config = config;

    return this;
  }


  singleton(isSingleton) {

    this.settings.isSingleton = !!isSingleton ? isSingleton : true;

    return this;
  }


  noInjection(injectionDisabled) {

    if (this.settings.injectInto) {
      throw new Error(`'noInjection' induces a conflict to the 'injectInto' declaration.`);
    }

    if (this.settings.isLazy) {
      throw new Error(`'noInjection' induces a conflict to the 'injectLazy' declaration.`);
    }

    this.settings.wantsInjection = !!injectionDisabled ? !injectionDisabled : false;

    return this;
  }


  injectInto(targetFunction) {

    if (!this.settings.wantsInjection) {
      throw new Error(`'injectInto' induces a conflict to the 'noInjection' declaration.`);
    }

    this.settings.injectInto = targetFunction;

    return this;
  }


  injectLazy(isLazy) {

    if (!this.settings.wantsInjection) {
      throw new Error(`'injectLazy' induces a conflict to the 'noInjection' declaration.`);
    }

    this.settings.isLazy = !!isLazy ? isLazy : true;

    return this;
  }


  bindFunctions() {

    this.settings.bindFunctions = true;

    if (arguments.length > 0) {

      Array.prototype.push.apply(this.settings.functionsToBind, arguments);
    }

    return this;
  }
}

module.exports = TypeRegistration;
