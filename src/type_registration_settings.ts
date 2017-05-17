import {ITypeRegistrationSettings, Type, IRegistrationSettings, ITags, IOverwrittenKeys, RegistrationKey, IResolver, TypeConfig} from './interfaces';

export class TypeRegistrationSettings<T> implements ITypeRegistrationSettings<T> {

  public defaults: IRegistrationSettings;
  protected settings: ITypeRegistrationSettings<T> = {};

  constructor(registrationSettings: ITypeRegistrationSettings<T>|IRegistrationSettings) {
    Object.assign(this.settings, registrationSettings);
  }

  public get key(): RegistrationKey {
    return this.settings.key;
  }

  public set key(value: RegistrationKey) {
    this.settings.key = value;
  }

  public get type(): Type<T> {
    return this.settings.type;
  }

  public set type(value: Type<T>) {
    this.settings.type = value;
  }

  public get object(): any {
    return this.settings.object;
  }

  public set object(value: any) {
    this.settings.object = value;
  }

  public get factory(): any {
    return this.settings.factory;
  }

  public set factory(value: any) {
    this.settings.factory = value;
  }

  public get resolver(): IResolver {
    return this._getCurrentOrDefault('resolver');
  }

  public get module(): string {
    return this._getCurrentOrDefault('module');
  }

  public get config(): TypeConfig {
    return this._getCurrentOrDefault('config');
  }

  public get dependencies(): Array<string>  {
    return this._getCurrentOrDefaultArray('dependencies');
  }

  public get ownedDependencies(): Array<string>  {
    return this._getCurrentOrDefaultArray('ownedDependencies');
  }

  public get lazyDependencies(): Array<string> {
    return this._getCurrentOrDefaultArray('lazyDependencies');
  }

  public get lazyDependenciesAsync(): Array<string> {
    return this._getCurrentOrDefaultArray('lazyDependenciesAsync');
  }

  public get isSingleton(): boolean {
    return this._getCurrentOrDefault('isSingleton');
  }

  public get isObject(): boolean {
    return this._getCurrentOrDefault('isObject');
  }

  public get isFactory(): boolean {
    return this._getCurrentOrDefault('isFactory');
  }

  public get wantsInjection(): boolean {
    return this._getCurrentOrDefault('wantsInjection');
  }

  public get injectInto(): string {
    return this._getCurrentOrDefault('injectInto');
  }

  public get functionsToBind(): Array<string> {
    return this._getCurrentOrDefaultArray('functionsToBind');
  }

  public get overwrittenKeys(): IOverwrittenKeys {
    return this._getCurrentOrDefaultIndexer('overwrittenKeys');
  }

  private _getCurrentOrDefault(key: string): any {
    return typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
  }

  private _getCurrentOrDefaultArray(key: string): Array<any> {
    const defaultValue = typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
    return defaultValue || [];
  }

  private _getCurrentOrDefaultIndexer(key: string): any {

    const defaultValue = typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
    
    if (!defaultValue) {
      const value = {};
      this.settings[key] = value;
      return value;
    }

    return defaultValue;
  }

}