'use strict';

class TypeRegistrationSettings {

  constructor(defaults, key, type, isFactory) {
    this._defaults = defaults;
    this._key = key;
    this._type = type;
    this._isFactory = isFactory;
  }

  get defaults() {
    return this._defaults;
  }

  get key() {
    return this._key;
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

  set dependencies(value) {
    this._dependencies = value;
  }

  get config() {
    return this._config;
  }

  set config(value) {
    this._config = value;
  }

  get isSingleton() {
    return typeof this._isSingleton !== 'undefined' ? this._isSingleton : this.defaults.isSingleton;
  }

  set isSingleton(value) {
    this._isSingleton = value;
  }

  get wantsInjection() {
    return typeof this._wantsInjection !== 'undefined' ? this._wantsInjection : this.defaults.wantsInjection;
  }

  set wantsInjection(value) {
    this._wantsInjection = value;
  }

  get injectInto() {
    return this._injectInto;
  }

  set injectInto(value) {
    this._injectInto = value;
  }

  get isLazy() {
    return this._isLazy !== 'undefined' ? this._isLazy : this.defaults.isLazy;
  }

  set isLazy(value) {
    this._isLazy = value;
  }
}

module.exports = TypeRegistrationSettings;
