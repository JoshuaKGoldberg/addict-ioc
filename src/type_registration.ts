import {RegistrationKey, Type, ITypeRegistrationSettings, ITypeRegistration} from './interfaces';

export class TypeRegistration<T> implements ITypeRegistration<T> {

  private _settings: ITypeRegistrationSettings<T>;

  constructor(settings: ITypeRegistrationSettings<T>) {
    this._settings = this._ensureSettings(settings);
  }

  private _ensureSettings(settings: ITypeRegistrationSettings<T>): ITypeRegistrationSettings<T> {
    const baseSettings = {
      overwrittenKeys: {},
      tags: {}
    };
    return Object.assign(baseSettings, settings);
  } 

  public get settings(): ITypeRegistrationSettings<T> {
    return this._settings;
  }

  public configure(config: any): ITypeRegistration<T> {
    this.settings.config = config;
    return this;
  }

  public dependencies(...dependencies: Array<RegistrationKey>): ITypeRegistration<T> {
    this.settings.dependencies = dependencies;
    return this;
  }

  public singleton(isSingleton: boolean = true): ITypeRegistration<T> {
    this.settings.isSingleton = isSingleton;
    return this;
  }

  public injectLazy(...lazyDependencies: Array<RegistrationKey>): ITypeRegistration<T> {
    this.settings.lazyDependencies = lazyDependencies;
    return this;
  }

  public injectPromiseLazy(...lazyPromiseDependencies: Array<RegistrationKey>): ITypeRegistration<T> {
    this.settings.lazyPromiseDependencies = lazyPromiseDependencies;
    return this;
  }

  public injectInto(targetFunction: string): ITypeRegistration<T> {
    this.settings.injectInto = targetFunction;
    return this;
  }

  public bindFunctions(...functionsToBind: Array<string>): ITypeRegistration<T> {
    this.settings.functionsToBind = functionsToBind;
    return this;
  }

  public tags(...tags: Array<string>): ITypeRegistration<T> {
    tags.forEach((tag) => {
      if (!this.settings.tags[tag]) {
        this.settings.tags[tag] = {};
      }
    });
    return this;
  }

  public setTag(tag: string, value: any): ITypeRegistration<T> {
    this.settings.tags[tag] = value;
    return this;
  }

  public overwrite(originalKey: string, overwrittenKey: string): ITypeRegistration<T> {
    this.settings.overwrittenKeys[originalKey] = overwrittenKey;
    return this;
  }

  public owns(...ownedDependencies): ITypeRegistration<T> {
    this.settings.ownedDependencies = ownedDependencies;
    return this;
  }

}