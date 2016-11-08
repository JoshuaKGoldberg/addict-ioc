import {ITypeRegistrationSettings} from './interfaces';

export class TypeRegistrationSettings implements ITypeRegistrationSettings {

  public defaults: ITypeRegistrationSettings = undefined;
  public key: any = undefined;
  public type: any = undefined;
  public dependencies: string|Array<string> = undefined;
  public tags: any = undefined;
  public config: any = undefined;
  public injectInto: string = undefined;
  public functionsToBind: string|Array<string> = undefined;
  public lazyKeys: string|Array<string> = undefined;
  public overwrittenKeys: string|Array<string> = undefined;

  private _isSingleton: boolean = undefined;
  private _wantsInjection: boolean = undefined;
  private _isLazy: boolean = undefined;
  private _bindFunctions: boolean = undefined;
  private _subscriptions: any = undefined;
  private _isFactory: boolean = undefined;
  private _isRequire: boolean = undefined;
  private _autoCreateMissingSubscribers: boolean = undefined;

  constructor(defaults: ITypeRegistrationSettings, key: any, type: any, isFactory: boolean, isRequire: boolean) {

    this._subscriptions = {
      newInstance: []
    };

    this.defaults = defaults;
    this.key = key;
    this.type = type;

    this._isFactory = isFactory;
    this._isRequire = isRequire;
  }

  get isFactory(): boolean {
    return typeof this._isFactory !== 'undefined' ? this._isFactory : false;
  }

  get subscriptions(): any {
    return this._subscriptions;
  }

  get isSingleton(): boolean {
    return typeof this._isSingleton !== 'undefined' ? this._isSingleton : this.defaults.isSingleton;
  }

  set isSingleton(value: boolean) {
    this._isSingleton = value;
  }

  get wantsInjection(): boolean {
    return typeof this._wantsInjection !== 'undefined' ? this._wantsInjection : this.defaults.wantsInjection;
  }

  set wantsInjection(value: boolean) {
    this._wantsInjection = value;
  }

  get isLazy(): boolean {
    return this._isLazy !== 'undefined' ? this._isLazy : this.defaults.isLazy;
  }

  set isLazy(value: boolean) {
    this._isLazy = value;
  }

  get bindFunctions(): boolean {
    return this._bindFunctions !== 'undefined' ? this._bindFunctions : this.defaults.bindFunctions;
  }

  set bindFunctions(value: boolean) {
    this._bindFunctions = value;
  }

  get autoCreateMissingSubscribers(): boolean {
    return this._autoCreateMissingSubscribers ? this._autoCreateMissingSubscribers : this.defaults.autoCreateMissingSubscribers;
  }

  set autoCreateMissingSubscribers(value: boolean) {
    this._autoCreateMissingSubscribers = value;
  }

  get isRequire(): boolean {
    return typeof this._isRequire !== 'undefined' ? this._isRequire : false;
  }

  set isRequire(value: boolean) {
    this._isRequire = value;
  }
}
