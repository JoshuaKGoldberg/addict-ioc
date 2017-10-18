// tslint:disable-next-line:max-line-length
import {
  IInstanceWrapper,
  IOverwrittenConventionCalls,
  IRegistration,
  IRegistrationSettings,
  IResolver,
  ISpecializedRegistration,
  ITypeRegistration,
  ITypeRegistrationSettings,
  RegistrationKey,
  Type,
} from './interfaces';

export class Registration<TRegistration extends IRegistration, TRegistrationSettings extends IRegistrationSettings> implements ISpecializedRegistration<TRegistration, TRegistrationSettings> {

  private _settings: TRegistrationSettings;

  constructor(settings: TRegistrationSettings) {
    this._settings = this._ensureSettings(settings);
  }

  private _ensureSettings(settings: TRegistrationSettings): TRegistrationSettings {
    const baseSettings: TRegistrationSettings = {
      overwrittenKeys: {},
      tags: {},
    } as TRegistrationSettings;
    return Object.assign(baseSettings, settings);
  }

  public get settings(): TRegistrationSettings {
    return this._settings;
  }

  public configure(config: any): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    this.settings.config = config;
    return this;
  }

  public dependencies(...dependencies: Array<RegistrationKey>): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    this.settings.dependencies = dependencies;
    return this;
  }

  public singleton(isSingleton: boolean = true): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    this.settings.isSingleton = isSingleton;
    return this;
  }

  public isTrueSingleton(): ISpecializedRegistration<T, U> {
    this.settings.isTrueSingleton = true;
    return this;
  }

  public transient(isTransient: boolean = true): ISpecializedRegistration<T, U> {
    this.settings.isSingleton = !isTransient;
    return this;
  }

  public injectLazy(...lazyDependencies: Array<RegistrationKey>): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    this.settings.lazyDependencies = lazyDependencies;
    this.settings.wantsLazyInjection = true;
    return this;
  }

  public injectPromiseLazy(...lazyPromiseDependencies: Array<RegistrationKey>): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    this.settings.lazyDependenciesAsync = lazyPromiseDependencies;
    this.settings.wantsLazyInjectionAsync = true;
    return this;
  }

  public injectInto(targetFunction: string): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    this.settings.injectInto = targetFunction;
    return this;
  }

  public bindFunctions(...functionsToBind: Array<string>): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    this.settings.functionsToBind = functionsToBind;
    return this;
  }

  public tags(...tags: Array<string>): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    for (const tag of tags) {
      if (!this.settings.tags[tag]) {
        this.settings.tags[tag] = {};
      }
    }
    return this;
  }

  public setTag(tag: string, value: any): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    this.settings.tags[tag] = value;
    return this;
  }

  public overwrite(originalKey: string, overwrittenKey: string): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    this.settings.overwrittenKeys[originalKey] = overwrittenKey;
    return this;
  }

  public owns(...ownedDependencies: Array<string>): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    this.settings.ownedDependencies = ownedDependencies;
    return this;
  }

  public withResolver<TType = any, TInstanceWrapper extends IInstanceWrapper<TType> = any>(resolver: IResolver<TType, TInstanceWrapper>): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    this.settings.resolver = resolver;
    return this;
  }

  public overwriteConventionCalls(conventionCalls: IOverwrittenConventionCalls): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    this.settings.overwrittenConventionCalls = conventionCalls;
    return this;
  }

  public injectConventionCalled(registrationKey: string, conventionCall: string): ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    this.settings.injectConventionCalled[registrationKey] = conventionCall;
    return this;
  }

}
