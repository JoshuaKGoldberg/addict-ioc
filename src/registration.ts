// tslint:disable-next-line:max-line-length
import { IInstanceWrapper, IRegistration, IRegistrationSettings, IResolver, ISpecializedRegistration, ITypeRegistration, ITypeRegistrationSettings, RegistrationKey, Type } from './interfaces';

export class Registration<T extends IRegistration, U extends IRegistrationSettings> implements ISpecializedRegistration<T, U> {

  private _settings: U;

  constructor(settings: U) {
    this._settings = this._ensureSettings(settings);
  }

  private _ensureSettings(settings: U): U {
    const baseSettings: U = {
      overwrittenKeys: {},
      tags: {},
    } as U;
    return Object.assign(baseSettings, settings);
  }

  public get settings(): U {
    return this._settings;
  }

  public configure(config: any): ISpecializedRegistration<T, U> {
    this.settings.config = config;
    return this;
  }

  public dependencies(...dependencies: Array<RegistrationKey>): ISpecializedRegistration<T, U> {
    this.settings.dependencies = dependencies;
    return this;
  }

  public singleton(isSingleton: boolean = true): ISpecializedRegistration<T, U> {
    this.settings.isSingleton = isSingleton;
    return this;
  }

  public transient(isTransient: boolean = true): ISpecializedRegistration<T, U> {
    this.settings.isSingleton = !isTransient;
    return this;
  }

  public injectLazy(...lazyDependencies: Array<RegistrationKey>): ISpecializedRegistration<T, U> {
    this.settings.lazyDependencies = lazyDependencies;
    this.settings.wantsLazyInjection = true;
    return this;
  }

  public injectPromiseLazy(...lazyPromiseDependencies: Array<RegistrationKey>): ISpecializedRegistration<T, U> {
    this.settings.lazyDependenciesAsync = lazyPromiseDependencies;
    this.settings.wantsLazyInjectionAsync = true;
    return this;
  }

  public injectInto(targetFunction: string): ISpecializedRegistration<T, U> {
    this.settings.injectInto = targetFunction;
    return this;
  }

  public bindFunctions(...functionsToBind: Array<string>): ISpecializedRegistration<T, U> {
    this.settings.functionsToBind = functionsToBind;
    return this;
  }

  public tags(...tags: Array<string>): ISpecializedRegistration<T, U> {
    for (const tag of tags) {
      if (!this.settings.tags[tag]) {
        this.settings.tags[tag] = {};
      }
    }
    return this;
  }

  public setTag(tag: string, value: any): ISpecializedRegistration<T, U> {
    this.settings.tags[tag] = value;
    return this;
  }

  public overwrite(originalKey: string, overwrittenKey: string): ISpecializedRegistration<T, U> {
    this.settings.overwrittenKeys[originalKey] = overwrittenKey;
    return this;
  }

  public owns(...ownedDependencies: Array<string>): ISpecializedRegistration<T, U> {
    this.settings.ownedDependencies = ownedDependencies;
    return this;
  }

  public withResolver<V extends IInstanceWrapper<T> = any>(resolver: IResolver<T, V>): ISpecializedRegistration<T, U> {
    this.settings.resolver = resolver;
    return this;
  }

}
