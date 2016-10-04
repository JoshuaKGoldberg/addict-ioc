
interface IProvideConfig {
  get: (config: string) => any;
}

interface ITypeRegistrationSettings {
  defaults: ITypeRegistrationSettings;
  key: any;
  type: any;
  isFactory: boolean;
  isRequire: boolean;
  dependencies: string|string[];
  tags: any;
  config: any;
  isSingleton: boolean;
  wantsInjection: boolean;
  injectInto: string;
  isLazy: boolean;
  bindFunctions: boolean;
  functionsToBind: string|string[];
  lazyKeys: string|string[];
  overwrittenKeys: string|string[];
  autoCreateMissingSubscribers: boolean;
  autoCreateMissingRegistrations: boolean;
  isRequire: boolean;
}

interface IDependencyInjectionContainerConfig {
  registrationDefaults: ITypeRegistrationSettings;
  injectContainerKey: string;
  circularDependencyCanIncludeSingleton: boolean;
  circularDependencyCanIncludeLazy: boolean;
}
