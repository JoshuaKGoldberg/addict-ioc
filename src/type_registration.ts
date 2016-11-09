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

  public dependencies(...args) {

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

  public configure(config: any) {

    const configType = typeof config;

    if (configType !== 'function' && configType !== 'object' && configType !== 'string') {

      throw new Error(`The type '${configType}' of your dependencies declaration is not yet supported.
              Supported types: 'Function', 'Object'`);
    }

    this.settings.config = config;

    return this;
  }

  public singleton(isSingleton: boolean) {

    this.settings.isSingleton = !!isSingleton ? isSingleton : true;

    return this;
  }

  public noInjection(injectionDisabled: boolean) {

    if (this.settings.injectInto) {
      throw new Error(`'noInjection' induces a conflict to the 'injectInto' declaration.`);
    }

    if (this.settings.isLazy) {
      throw new Error(`'noInjection' induces a conflict to the 'injectLazy' declaration.`);
    }

    this.settings.wantsInjection = !!injectionDisabled ? !injectionDisabled : false;

    return this;
  }

  public injectInto(targetFunction: string) {

    if (!this.settings.wantsInjection) {
      throw new Error(`'injectInto' induces a conflict to the 'noInjection' declaration.`);
    }

    this.settings.injectInto = targetFunction;

    return this;
  }

  public injectLazy() {

    if (!this.settings.wantsInjection) {
      throw new Error(`'injectLazy' induces a conflict to the 'noInjection' declaration.`);
    }

    this.settings.isLazy = true;

    if (arguments.length > 0) {

      Array.prototype.push.apply(this.settings.lazyKeys, arguments);
    }

    return this;
  }

  public onNewInstance(key: string, targetFunction: string) {

    const subscription = {
      key: key,
      method: targetFunction
    };

    this.settings.subscriptions['newInstance'].push(subscription);

    return this;
  }

  public bindFunctions() {

    this.settings.bindFunctions = true;

    if (arguments.length > 0) {

      Array.prototype.push.apply(this.settings.functionsToBind, arguments);
    }

    return this;
  }

  public tags(tagOrTags: string | string[]) {

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

  public setAttribute(tag: string, value: any) {

    if (!tag) {
      throw new Error(`You have to specify a tag for your attribute.`);
    }

    this.settings.tags[tag] = value;

    return this;
  }

  public hasTags(tags: string | Array<string>) {

    const declaredTags = Object.keys(this.settings.tags);

    if (!Array.isArray(tags)) {
      tags = [tags];
    }

    const isTagMissing = (<Array<string>>tags).some((tag) => {

      if (declaredTags.indexOf(tag) < 0) {

        return true;
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

  public overwrite(originalKey: string, overwrittenKey: string) {

    if (this.settings.dependencies.indexOf(originalKey) < 0) {
      throw new Error(`there is no dependency declared for original key '${originalKey}'.`);
    }

    this.settings.overwrittenKeys[originalKey] = overwrittenKey;

    return this;
  }
}
