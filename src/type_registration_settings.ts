import {ITypeRegistrationSettings, IHookSubscriptions} from './interfaces';

export class TypeRegistrationSettings implements ITypeRegistrationSettings {

  private _defaults: ITypeRegistrationSettings = undefined;
  private _key: string = undefined;
  private _type: any = undefined;
  private _dependencies: string | Array<string> = undefined;
  private _config: any = undefined;
  private _tags: any = undefined;
  private _injectInto: string = undefined;
  private _functionsToBind: string|Array<string> = undefined;
  private _lazyKeys: string|Array<string> = undefined;
  private _overwrittenKeys: string|Array<string> = undefined;
  private _isSingleton: boolean = undefined;
  private _wantsInjection: boolean = undefined;
  private _isLazy: boolean = undefined;
  private _bindFunctions: boolean = undefined;
  private _subscriptions: IHookSubscriptions = undefined;
  private _isFactory: boolean = undefined;
  private _isObject: boolean = undefined;
  private _autoCreateMissingSubscribers: boolean = undefined;

  constructor(defaults: ITypeRegistrationSettings, key: string, type: any, isFactory?: boolean, isObject?: boolean) {

    this._subscriptions = {
      newInstance: []
    };

    this._defaults = defaults;
    this._key = key;
    this._type = type;

    this._isFactory = isFactory || false;
    this._isObject = isObject || false;
  }

  get defaults(): ITypeRegistrationSettings {
    return this._defaults;
  }

  get key(): any {
    return this._key;
  }

  get type(): any {
    return this._type;
  }

  get dependencies(): string | Array<string> {
    return this._dependencies;
  }

  set dependencies(value: string | Array<string>) {
    this._dependencies = value;
  }

  get config(): any {
    return this._config;
  }

  set config(value: any) {
    this._config = value;
  }

  get tags(): any {
    return this._tags;
  }

  set tags(value: any) {
    this._tags = value;
  }

  get injectInto() {
    return this._injectInto;
  }

  set injectInto(value: string) {
    this._injectInto = value;
  }

  get functionsToBind(): string | Array<string> {
    return this._functionsToBind;
  }

  set functionsToBind(value: string | Array<string>) {
    this._functionsToBind = value;
  }

  get lazyKeys(): string | Array<string> {
    return this._lazyKeys;
  }

  set lazyKeys(value: string | Array<string>) {
    this._lazyKeys = value;
  }

  get overwrittenKeys(): string | Array<string> {
    return this._overwrittenKeys;
  }

  set overwrittenKeys(value: string | Array<string>) {
    this._overwrittenKeys = value;
  }

  get isFactory(): boolean {
    return this.getSettingOrDefault('isFactory');
  }

  get subscriptions(): IHookSubscriptions {
    return this._subscriptions;
  }

  get isSingleton(): boolean {
    return this.getSettingOrDefault('isSingleton');
  }

  set isSingleton(value: boolean) {
    this._isSingleton = value;
  }

  get wantsInjection(): boolean {
    return this.getSettingOrDefault('wantsInjection');
  }

  set wantsInjection(value: boolean) {
    this._wantsInjection = value;
  }

  get isLazy(): boolean {
    return this.getSettingOrDefault('isLazy');
  }

  set isLazy(value: boolean) {
    this._isLazy = value;
  }

  get bindFunctions(): boolean {
    return this.getSettingOrDefault('bindFunctions');
  }

  set bindFunctions(value: boolean) {
    this._bindFunctions = value;
  }

  get autoCreateMissingSubscribers(): boolean {
    return this.getSettingOrDefault('autoCreateMissingSubscribers');
  }

  set autoCreateMissingSubscribers(value: boolean) {
    this._autoCreateMissingSubscribers = value;
  }

  get isObject(): boolean {
    return this._isObject;
  }

  set isObject(value: boolean) {
    this._isObject = value;
  }

  private getSettingOrDefault(key) {
    return typeof this[`_${key}`] !== 'undefined' ? this[`_${key}`] : this.defaults[key];
  }
}
