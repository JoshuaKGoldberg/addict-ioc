import {TypeRegistration} from './type_registration';

export interface IProvideConfig {
  get: (config: string) => any;
}

export interface ITypeRegistrationSettings {
  defaults?: ITypeRegistrationSettings;
  key?: string;
  type?: any;
  isFactory?: boolean;
  isObject?: boolean;
  dependencies?: Array<string>;
  tags?: any;
  config?: any;
  isSingleton?: boolean;
  wantsInjection?: boolean;
  injectInto?: string;
  isLazy?: boolean;
  bindFunctions?: boolean;
  functionsToBind?: Array<string>;
  lazyKeys?: Array<string>;
  overwrittenKeys?: any;
  optionalDependencies?: Array<string>;
  autoCreateMissingSubscribers?: boolean;
  subscriptions?: IHookSubscriptions;
}

export interface IHookSubscriptions {
  [hook: string]: Array<IHookSubscription>;
}

export interface IHookSubscription {
  key: string;
  method: string;
}

export interface IDependencyInjectionContainerConfig {
  registrationDefaults: ITypeRegistrationSettings;
  injectContainerKey: string;
  circularDependencyCanIncludeSingleton: boolean;
  circularDependencyCanIncludeLazy: boolean;
}

export interface IRegistrations {
  [key: string]: TypeRegistration;
}

export interface IInstances {
  [key: string]: any;
}
