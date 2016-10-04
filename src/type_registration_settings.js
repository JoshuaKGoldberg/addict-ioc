
import {ITypeRegistrationSettings} from './interfaces';

export class TypeRegistrationSettings implements ITypeRegistrationSettings  {

  constructor(defaults: TypeRegistrationSettings,
    key: any,
    type: any,
    isFactory: boolean,
    isRequire: boolean) {

      this._defaults = defaults;
      this._key = key;
      this._type = type;
      this._subscriptions = {
        newInstance: []
      };
      this._isFactory = isFactory;
      this._isRequire = isRequire;
      this._functionsToBind = [];
      this._lazyKeys = [];
      this._tags = {};
      this._overwrittenKeys = {};
    }

    get defaults() {
      return this._defaults;
    }

    get key() {
      return this._key;
    }

    set key(value: any) {
      this._key = value;
    }

    get type() {
      return this._type;
    }

    get isFactory() {
      return typeof this._isFactory !== 'undefined' ? this._isFactory : false;
    }

    get dependencies() {
      return this._dependencies;
    }

    set dependencies(value: string|string[]) {
      this._dependencies = value;
    }

    get tags() {
      return this._tags;
    }

    set tags(value: any) {
      this._tags = value;
    }

    get subscriptions() {
      return this._subscriptions;
    }

    get config() {
      return this._config;
    }

    set config(value: any) {
      this._config = value;
    }

    get isSingleton() {
      return typeof this._isSingleton !== 'undefined' ? this._isSingleton : this.defaults.isSingleton;
    }

    set isSingleton(value: boolean) {
      this._isSingleton = value;
    }

    get wantsInjection() {
      return typeof this._wantsInjection !== 'undefined' ? this._wantsInjection : this.defaults.wantsInjection;
    }

    set wantsInjection(value: boolean) {
      this._wantsInjection = value;
    }

    get injectInto() {
      return this._injectInto;
    }

    set injectInto(value: string) {
      this._injectInto = value;
    }

    get isLazy() {
      return this._isLazy !== 'undefined' ? this._isLazy : this.defaults.isLazy;
    }

    set isLazy(value: boolean) {
      this._isLazy = value;
    }

    get bindFunctions() {
      return this._bindFunctions !== 'undefined' ? this._bindFunctions : this.defaults.bindFunctions;
    }

    set bindFunctions(value: boolean) {
      this._bindFunctions = value;
    }

    get functionsToBind() {
      return this._functionsToBind;
    }

    get lazyKeys() {
      return this._lazyKeys;
    }

    get overwrittenKeys() {
      return this._overwrittenKeys;
    }

    get autoCreateMissingSubscribers() {
      return this._autoCreateMissingSubscribers ? this._autoCreateMissingSubscribers : this.defaults.autoCreateMissingSubscribers;
    }

    set autoCreateMissingSubscribers(value: boolean) {
      this._autoCreateMissingSubscribers = value;
    }

    get autoCreateMissingRegistrations() {
      return this._autoCreateMissingRegistrations ? this._autoCreateMissingRegistrations : this.defaults.autoCreateMissingRegistrations;
    }

    set autoCreateMissingRegistrations(value: boolean) {
      this._autoCreateMissingRegistrations = value;
    }

    get isRequire() {
      return typeof this._isRequire !== 'undefined' ? this._isRequire : false;
    }

    set isRequire(value: boolean) {
      this._isRequire = value;
    }
}
