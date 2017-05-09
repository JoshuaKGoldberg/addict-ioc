import {RegistrationKey, Type, ITypeRegistrationSettings, ITypeRegistration} from './interfaces';

export class TypeRegistration<T> implements ITypeRegistration<T> {

  private _settings: ITypeRegistrationSettings<T>;

  constructor(settings: ITypeRegistrationSettings<T>) {
    this._settings = settings;
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

}