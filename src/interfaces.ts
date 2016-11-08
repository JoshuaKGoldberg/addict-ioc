
interface IProvideConfig {
  get: (config: string) => any;
}

interface ITypeRegistrationSettings {
  defaults: ITypeRegistrationSettings;
  key: any;
  type: any;
  isFactory: boolean;
  isRequire: boolean;
  dependencies: string|Array<string>;
  tags: any;
  config: any;
  isSingleton: boolean;
  wantsInjection: boolean;
  injectInto: string;
  isLazy: boolean;
  bindFunctions: boolean;
  functionsToBind: string|Array<string>;
  lazyKeys: string|Array<string>;
  overwrittenKeys: string|Array<string>;
  autoCreateMissingSubscribers: boolean;
}

interface IDependencyInjectionContainerConfig {
  registrationDefaults: ITypeRegistrationSettings;
  injectContainerKey: string;
  circularDependencyCanIncludeSingleton: boolean;
  circularDependencyCanIncludeLazy: boolean;
}
