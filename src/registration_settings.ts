import { IFactoryRegistrationSettings, IInstanceWrapper, IObjectRegistrationSettings, IOverwrittenKeys, IRegistrationSettings,
  IResolver, ITags, ITypeRegistrationSettings, RegistrationKey, Type, TypeConfig } from './interfaces';

export class RegistrationSettings<T> implements IRegistrationSettings {

  public defaults: IRegistrationSettings;
  public settings: IRegistrationSettings = {};

  constructor(registrationSettings: IRegistrationSettings) {
    Object.assign(this.settings, registrationSettings);
  }

  public get key(): RegistrationKey {
    return this.settings.key;
  }

  public set key(value: RegistrationKey) {
    this.settings.key = value;
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

  public get resolver(): IResolver<T, IInstanceWrapper<T>> {
    return this._getCurrentOrDefault('resolver');
  }

  public set resolver(value: IResolver<T, IInstanceWrapper<T>>) {
    this.settings.resolver = value;
  }

  public get module(): string {
    return this._getCurrentOrDefault('module');
  }

  public set module(value: string) {
    this.settings.module = value;
  }

  public get config(): TypeConfig {
    return this._getCurrentOrDefault('config');
  }

  public set config(value: TypeConfig) {
    this.settings.config = value;
  }

  public get dependencies(): Array<string>  {
    return this._getCurrentOrDefaultArray('dependencies');
  }

  public set dependencies(value: Array<string>) {
    this.settings.dependencies = value;
  }

  public get ownedDependencies(): Array<string>  {
    return this._getCurrentOrDefaultArray('ownedDependencies');
  }

  public set ownedDependencies(value: Array<string>) {
    this.settings.ownedDependencies = value;
  }

  public get lazyDependencies(): Array<string> {
    return this._getCurrentOrDefaultArray('lazyDependencies');
  }

  public set lazyDependencies(value: Array<string>) {
    this.settings.lazyDependencies = value;
  }

  public get lazyDependenciesAsync(): Array<string> {
    return this._getCurrentOrDefaultArray('lazyDependenciesAsync');
  }

  public set lazyDependenciesAsync(value: Array<string>) {
    this.settings.lazyDependenciesAsync = value;
  }

  public get isSingleton(): boolean {
    return this._getCurrentOrDefault('isSingleton');
  }

  public set isSingleton(value: boolean) {
    this.settings.isSingleton = value;
  }

  public get isObject(): boolean {
    return this._getCurrentOrDefault('isObject');
  }

  public set isObject(value: boolean) {
    this.settings.isObject = value;
  }

  public get isFactory(): boolean {
    return this._getCurrentOrDefault('isFactory');
  }

  public set isFactory(value: boolean) {
    this.settings.isFactory = value;
  }

  public get wantsInjection(): boolean {
    return this._getCurrentOrDefault('wantsInjection');
  }

  public set wantsInjection(value: boolean) {
    this.settings.wantsInjection = value;
  }

  public get injectInto(): string {
    return this._getCurrentOrDefault('injectInto');
  }

  public set injectInto(value: string) {
    this.settings.injectInto = value;
  }

  public get functionsToBind(): Array<string> {
    return this._getCurrentOrDefaultArray('functionsToBind');
  }

  public set functionsToBind(value: Array<string>) {
    this.settings.functionsToBind = value;
  }

  public get overwrittenKeys(): IOverwrittenKeys {
    return this._getCurrentOrDefaultIndexer('overwrittenKeys');
  }

  public set overwrittenKeys(value: IOverwrittenKeys) {
    this.settings.overwrittenKeys = value;
  }

  private _getCurrentOrDefault(key: string): any {
    return typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
  }

  private _getCurrentOrDefaultArray(key: string): Array<any> {
    const defaultValue: Array<any> = typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];
    return defaultValue || [];
  }

  private _getCurrentOrDefaultIndexer(key: string): any {

    const defaultValue: any = typeof this.settings[key] !== 'undefined' ? this.settings[key] : this.defaults[key];

    if (!defaultValue) {
      const value: any = {};
      this.settings[key] = value;
      return value;
    }

    return defaultValue;
  }

}

export class TypeRegistrationSettings<T> extends RegistrationSettings<T> {

  constructor(registrationSettings: ITypeRegistrationSettings<T>) {
    super(registrationSettings);
  }

  public get settings(): ITypeRegistrationSettings<T> {
    return this.settings;
  }

  public get type(): Type<T> {
    return this.settings.type;
  }

  public set type(value: Type<T>) {
    this.settings.type = value;
  }
}

export class ObjectRegistrationSettings<T> extends RegistrationSettings<T> {

  constructor(registrationSettings: IObjectRegistrationSettings<T>) {
    super(registrationSettings);
  }

  public get settings(): IObjectRegistrationSettings<T> {
    return this.settings;
  }

  public get object(): T {
    return this.settings.object;
  }

  public set object(value: T) {
    this.settings.object = value;
  }
}

export class FactoryRegistrationSettings<T> extends RegistrationSettings<T> {

  constructor(registrationSettings: IFactoryRegistrationSettings<T>) {
    super(registrationSettings);
  }

  public get settings(): IFactoryRegistrationSettings<T> {
    return this.settings;
  }

  public get object(): T {
    return this.settings.object;
  }

  public set object(value: T) {
    this.settings.object = value;
  }
}
