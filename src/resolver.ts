import {IContainer, ITypeRegistration, IRegistrationSettings, Type, TypeConfig, ITypeResolver} from './interfaces';
import {getPropertyDescriptor} from './utils';

// export class AsyncResolver implements ITypeResolver {

//   public async resolveType<T>(container: IContainer, registration: ITypeRegistration<T>): Promise<Type<T>> {
//     const module = await import(registration.settings.module);
//     return module[registration.settings.key];
//   }
// }

export class Resolver implements ITypeResolver {

  public resolveType<T>(container: IContainer, registration: ITypeRegistration<T>): Type<T> {
    return registration.settings.type;
  }

  public resolveConfig(config: TypeConfig): any {
    return config;
  }

  private _configureInstance(instance: any, config: any) {

    if (!config) {
      return;
    }

    const configPropertyDescriptor = getPropertyDescriptor(instance, 'config');

    if (configPropertyDescriptor === undefined || (!configPropertyDescriptor.writable && !configPropertyDescriptor.set)) {
      const instancePrototype = Object.getPrototypeOf(instance);

      throw new Error(`The setter for the config property on type '${instancePrototype.constructor.name}' is missing.`);
    }

    instance.config = config;
  }

  public createInstance<T>(container: IContainer, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>) {
    return this._createInstance(registration, dependencies, injectionArgs);
  }

  private _createInstance<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs: Array<any>): T {

    let instance: T;

    let type = registration.settings.type;

    const argumentsToBeInjected = dependencies.concat(injectionArgs);

    if (typeof type !== 'function') {

      instance = type;

      if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {

        this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
      }

    } else if (registration.settings.wantsInjection && !registration.settings.injectInto && argumentsToBeInjected.length > 0) {

      if (registration.settings.isFactory) {

        instance = this._createInstanceByFactoryWithInjection(type, argumentsToBeInjected);

      } else {

        instance = this._createInstanceByConstructorWithInjection(type, argumentsToBeInjected);
      }

    } else {
      if (registration.settings.isFactory) {

        instance = this._createInstanceByFactory(type);

      } else {

        instance = this._createInstanceByConstructor(type);
      }

      if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {

        this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
      }
    }

    return instance;
  }

  private _createInstanceByFactory(type: any) {
    const instance = type();
    return instance;
  }

  private _createInstanceByFactoryWithInjection(type: any, argumentsToBeInjected: Array<any>) {
    const instance = type.apply(undefined, argumentsToBeInjected);
    return instance;
  }

  private _createInstanceByConstructor(type) {
    const instance = new type();
    return instance;
  }

  private _createInstanceByConstructorWithInjection(type, argumentsToBeInjected) {
    const instance = new type(...argumentsToBeInjected);
    return instance;
  }

  private _injectDependenciesIntoInstance(registrationSettings: IRegistrationSettings, instance: any, argumentsToBeInjected: Array<any>) {

    let propertySource;

    if (registrationSettings.isFactory) {

      propertySource = instance;

    } else {

      propertySource = Object.getPrototypeOf(instance);
    }

    const injectionTargetPropertyDescriptor = getPropertyDescriptor(propertySource, registrationSettings.injectInto);

    if (injectionTargetPropertyDescriptor) {

      if (typeof injectionTargetPropertyDescriptor.value === 'function') {

        this._injectDependenciesIntoFunction(instance, injectionTargetPropertyDescriptor.value, argumentsToBeInjected);

      } else if (injectionTargetPropertyDescriptor.set) {

        this._injectDependenciesIntoProperty(instance, registrationSettings.injectInto, argumentsToBeInjected);

      } else {
        throw new Error(`The setter for the '${registrationSettings.injectInto}' property on type '${Object.getPrototypeOf(instance).constructor.name}' is missing.`);
      }

    } else {
      throw new Error(`The injection target '${registrationSettings.injectInto}' on type '${Object.getPrototypeOf(instance).constructor.name}' is missing.`);
    }
  }

  private _injectDependenciesIntoFunction(instance: any, targetFunction: any, argumentsToBeInjected: Array<any>) {
    targetFunction.apply(targetFunction, argumentsToBeInjected);
  }

  private _injectDependenciesIntoProperty(instance: any, property: string, argumentsToBeInjected: Array<any>) {
    instance[property] = argumentsToBeInjected;
  }

}