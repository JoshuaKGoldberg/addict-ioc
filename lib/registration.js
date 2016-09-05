'use strict';

const TypeRegistrationSettings = require('./registration_settings');

class TypeRegistration {

  constructor(defaults, key, type, isFactory, isRequire) {
    this._settings = new TypeRegistrationSettings(defaults, key, type, isFactory, isRequire);
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

    if (configType !== 'function' && configType !== 'object' && configType !== 'string') {

      throw new Error(`The type '${configType}' of your dependencies declaration is not yet supported.
              Supported types: 'Function', 'Object'`);
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


  injectLazy() {

    if (!this.settings.wantsInjection) {
      throw new Error(`'injectLazy' induces a conflict to the 'noInjection' declaration.`);
    }

    this.settings.isLazy = true;

    if (arguments.length > 0) {

      Array.prototype.push.apply(this.settings.lazyKeys, arguments);
    }

    return this;
  }


  onNewInstance(keyOrType, targetFunction) {

    const subscription = {
      key: keyOrType,
      method: targetFunction
    };

    this.settings.subscriptions.newInstance.push(subscription);

    return this;
  }


  bindFunctions() {

    this.settings.bindFunctions = true;

    if (arguments.length > 0) {

      Array.prototype.push.apply(this.settings.functionsToBind, arguments);
    }

    return this;
  }

  tags(tagOrTags) {

    for (let argumentIndex = 0; argumentIndex < arguments.length; argumentIndex++) {

      const argument = arguments[argumentIndex];
      const argumentType = typeof argument;

      if (Array.isArray(argument)) {

        argument.forEach((tag) => {

          this.settings.tags[tag] = {};
        });

      } else if (argumentType === 'string') {

        this.settings.tags[argument] = {};

      } else {

        throw new Error(`The type '${argumentType}' of your tags declaration is not yet supported.
                Supported types: 'Array', 'String'`);
      }
    }

    return this;
  }

  setAttribute(tag, value) {

    if (!tag) {
      throw new Error(`You have to specify a tag for your attribute.`);
    }

    this.settings.tags[tag] = value;

    return this;
  }

  _hasTags(tags) {

    const declaredTags = Object.keys(this.settings.tags);

    const isTagMissing = tags.some((tag) => {

      if (declaredTags.indexOf(tag) < 0) {

        return true;
      }
    });

    return !isTagMissing;
  }

  _hasAttributes(attributes) {

    const attributeKeys = Object.keys(attributes);

    const attributeMissing = attributeKeys.some((attribute) => {

      const attributeValue = this.settings.tags[attribute];

      if (attributeValue !== attributes[attribute]) {

        return true;
      }
    });

    return !attributeMissing;
  }

  overwrite(originalKey, overwrittenKey) {

    if (this.settings.dependencies.indexOf(originalKey) < 0) {
      throw new Error(`there is no dependency declared for original key '${originalKey}'.`);
    }

    this.settings.overwrittenKeys[originalKey] = overwrittenKey;

    return this;
  }
}

function create(options) {
  return new TypeRegistration(options.defaults, options.key, options.type, options.isFactory, options.isRequire);
}

module.exports = TypeRegistration;
module.exports.create = create;
