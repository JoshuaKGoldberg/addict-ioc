import {TypeRegistrationSettings} from './type_registration_settings';
import {ITypeRegistrationSettings} from './interfaces';

export class TypeRegistration {

  private _settings: ITypeRegistrationSettings = undefined;

  constructor(defaults: ITypeRegistrationSettings, key: string, type: any, isFactory?: boolean) {
    this._settings = new TypeRegistrationSettings(defaults, key, type, isFactory);
  }

  get settings() {
    return this._settings;
  }

  set settings(value: ITypeRegistrationSettings) {
    this._settings = value;
  }

  public dependencies(...args): TypeRegistration {

    const resolvedDepedencyConfigurations = [];

    args.forEach((currentDependencyConfiguration) => {

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

  public configure(config: any): TypeRegistration {

    const configType = typeof config;

    if (configType !== 'function' && configType !== 'object' && configType !== 'string') {

      throw new Error(`The type '${configType}' of your dependencies declaration is not yet supported.
              Supported types: 'Function', 'Object'`);
    }

    this.settings.config = config;

    return this;
  }

  public singleton(isSingleton: boolean): TypeRegistration {

    this.settings.isSingleton = typeof isSingleton === 'boolean' ? isSingleton : true;

    return this;
  }

  public noInjection(injectionDisabled: boolean): TypeRegistration {

    if (this.settings.injectInto) {
      throw new Error(`'noInjection' induces a conflict to the 'injectInto' declaration.`);
    }

    if (this.settings.isLazy) {
      throw new Error(`'noInjection' induces a conflict to the 'injectLazy' declaration.`);
    }

    this.settings.wantsInjection = !!injectionDisabled ? !injectionDisabled : false;

    return this;
  }

  public injectInto(targetFunction: string): TypeRegistration {

    if (!this.settings.wantsInjection) {
      throw new Error(`'injectInto' induces a conflict to the 'noInjection' declaration.`);
    }

    this.settings.injectInto = targetFunction;

    return this;
  }

  public injectLazy(): TypeRegistration {

    if (!this.settings.wantsInjection) {
      throw new Error(`'injectLazy' induces a conflict to the 'noInjection' declaration.`);
    }

    this.settings.isLazy = true;

    if (arguments.length > 0) {

      Array.prototype.push.apply(this.settings.lazyKeys, arguments);
    }

    return this;
  }

  public onNewInstance(key: string, targetFunction: string): TypeRegistration {

    const subscription = {
      key: key,
      method: targetFunction
    };

    this.settings.subscriptions['newInstance'].push(subscription);

    return this;
  }

  public bindFunctions(): TypeRegistration {

    this.settings.bindFunctions = true;

    if (arguments.length > 0) {

      Array.prototype.push.apply(this.settings.functionsToBind, arguments);
    }

    return this;
  }

  public tags(...tags: Array<string|Array<string>>): TypeRegistration {

    tags.forEach((tag) => {

      const argumentType = typeof tag;

      if (Array.isArray(tag)) {

        tag.forEach((tag) => {

          this.settings.tags[tag] = {};
        });

      } else if (argumentType === 'string') {

        this.settings.tags[tag] = {};

      } else {

        throw new Error(`The type '${argumentType}' of your tags declaration is not yet supported.
                Supported types: 'Array', 'String'`);
      }
    });

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

  public setAttribute(tag: string, value: any): TypeRegistration {

    if (!tag) {
      throw new Error(`You have to specify a tag for your attribute.`);
    }

    this.settings.tags[tag] = value;

    return this;
  }

  public hasTags(...tags: Array<string|Array<string>>) {

    const declaredTags = Object.keys(this.settings.tags);

    const isTagMissing = tags.some((tag) => {

      const argumentType = typeof tag;

      if (Array.isArray(tag)) {

        const isInnerTagMissing = tag.some((tag) => {
          
          const hasTags = this.hasTags(tag);

          if (!hasTags) {
            return true;
          }
        });

        if (isInnerTagMissing) {
          return true;
        }

      } else if (argumentType === 'string') {

        if (declaredTags.indexOf(tag) < 0) {

          return true;
        }

      } else {

        throw new Error(`The type '${argumentType}' of your tags declaration is not yet supported.
                Supported types: 'Array', 'String'`);
      }
    });

    return !isTagMissing;
  }

  public hasAttributes(attributes: any) {

    const attributeKeys = Object.keys(attributes);

    const attributeMissing = attributeKeys.some((attribute) => {

      const attributeValue = this.settings.tags[attribute];

      if (attributeValue !== attributes[attribute]) {

        return true;
      }
    });

    return !attributeMissing;
  }

  public overwrite(originalKey: string, overwrittenKey: string): TypeRegistration {

    if (this.settings.dependencies.indexOf(originalKey) < 0) {
      throw new Error(`there is no dependency declared for original key '${originalKey}'.`);
    }

    this.settings.overwrittenKeys[originalKey] = overwrittenKey;

    return this;
  }

  public optionalDependencies(...optionalDependencyKeys: Array<string|Array<string>>): TypeRegistration {

    optionalDependencyKeys.forEach((optionalDependencyKey) => {

      const argumentType = typeof optionalDependencyKey;

      if (Array.isArray(optionalDependencyKey)) {

        this.optionalDependencies(optionalDependencyKey);

      } else if (argumentType === 'string') {

        if (this.settings.optionalDependencies.indexOf(optionalDependencyKey) < 0) {
          this.settings.optionalDependencies.push(optionalDependencyKey);
        }

      } else {

        throw new Error(`The type '${argumentType}' of your tags declaration is not yet supported.
                Supported types: 'Array', 'String'`);
      }
    });

    return this;
  }
}
