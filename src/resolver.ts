import { IContainer, IInstanceWrapper, IRegistration, IRegistrationSettings, IResolver, ITypeRegistration, Type, TypeConfig } from './interfaces';
import {getPropertyDescriptor} from './utils';

export class Resolver<T, U extends IInstanceWrapper<T>> implements IResolver<T, U> {

  public hash(anything: any): string {
    // if (typeof anything === 'undefined' || anything === null || Array.isArray(anything)) {
    //   return "";
    // }
    if (!anything) {
      return anything;
    }
    return JSON.stringify(anything);
  }

  public hashType<V extends T = T>(type: Type<V>): string {
    return this.hash(type);
  }

  public hashObject<V extends T = T>(object: V): string {
    return this.hash(object);
  }

  public hashFactory<V extends T = T>(factory: V): string {
    return this.hash(factory);
  }

  public hashConfig(config: any): string {
    return this.hash(config);
  }

  public resolveType<V extends T = T>(container: IContainer<U>, registration: ITypeRegistration<V>): Type<V> {
    return registration.settings.type;
  }

  public async resolveTypeAsync<V extends T = T>(container: IContainer<U>, registration: ITypeRegistration<V>): Promise<Type<V>> {
    if (registration.settings.module) {
      const module: any = await import(registration.settings.module);
      return module[registration.settings.key];
    }
    return registration.settings.type;
  }

  public resolveObject(container: IContainer<U>, registration: IRegistration): any {
    return registration.settings.object;
  }

  public async resolveObjectAsync(container: IContainer<U>, registration: IRegistration): Promise<any> {
    if (registration.settings.module) {
      const module: any = await import(registration.settings.module);
      return module[registration.settings.key];
    }
    return registration.settings.object;
  }

  public resolveFactory(container: IContainer<U>, registration: IRegistration): any {
    return registration.settings.factory;
  }

  public async resolveFactoryAsync(container: IContainer<U>, registration: IRegistration): Promise<any> {
    if (registration.settings.module) {
      const module: any = await import(registration.settings.module);
      return module[registration.settings.key];
    }
    return registration.settings.factory;
  }

  public resolveConfig(config: TypeConfig): any {
    return config;
  }

  protected _configureInstance(instance: any, config: any): void {

    if (!config) {
      return;
    }

    const configPropertyDescriptor: PropertyDescriptor = getPropertyDescriptor(instance, 'config');

    if (configPropertyDescriptor === undefined || (!configPropertyDescriptor.writable && !configPropertyDescriptor.set)) {
      const instancePrototype: any = Object.getPrototypeOf(instance);

      throw new Error(`The setter for the config property on type '${instancePrototype.constructor.name}' is missing.`);
    }

    instance.config = config;
  }

  public createObject<V extends T = T>(container: IContainer<U>, object: V, registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs?: Array<any>): V {
    return this._createObject<V>(object, registration, dependencies, injectionArgs);
  }

  protected _createObject<V extends T = T>(object: V, registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs?: Array<any>): V {

    const argumentsToBeInjected: Array<any> = dependencies.concat(injectionArgs);

    if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
      this._injectDependenciesIntoInstance(registration.settings, object, argumentsToBeInjected);
    }

    return object;
  }

  public createFactory<V extends T = T>(container: IContainer<U>, type: V, registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs?: Array<any>): V {
    return this._createFactory(registration, dependencies, injectionArgs);
  }

  protected _createFactory<V extends T = T>(registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs?: Array<any>): V {

    const argumentsToBeInjected: Array<any> = dependencies.concat(injectionArgs);

    if (registration.settings.wantsInjection && !registration.settings.injectInto && injectionArgs.length > 0) {
      return this._createInstanceByFactoryWithInjection<V>(registration.settings.factory, argumentsToBeInjected);
    }

    const instance: V = this._createInstanceByFactory<V>(registration.settings.factory);

    if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
      this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
    }

    return instance;
  }

  public createInstance<V extends T = T>(container: IContainer<U>, type: V, registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs?: Array<any>): V {
    return this._createInstance(type, registration, dependencies, injectionArgs);
  }

  protected _createInstance<V extends T = T>(type: any, registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs: Array<any>): V {

    const argumentsToBeInjected: Array<any> = dependencies.concat(injectionArgs);

    if (registration.settings.wantsInjection && !registration.settings.injectInto && argumentsToBeInjected.length > 0) {
      return this._createInstanceByConstructorWithInjection<V>(type, argumentsToBeInjected);
    }

    const instance: V = this._createInstanceByConstructor<V>(type);

    if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
      this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
    }

    return instance;
  }

  protected _createInstanceByFactory<V extends T = T>(factoryFunction: any): V {
    const instance: V = factoryFunction();
    return instance;
  }

  protected _createInstanceByFactoryWithInjection<V extends T = T>(factoryFunction: any, argumentsToBeInjected: Array<any>): V {
    const instance: V = factoryFunction.apply(undefined, argumentsToBeInjected);
    return instance;
  }

  protected _createInstanceByConstructor<V extends T = T>(type: Type<V>): V {
    const instance: V = new type();
    return instance;
  }

  protected _createInstanceByConstructorWithInjection<V extends T = T>(type: Type<V>, argumentsToBeInjected: Array<any>): V {
    const instance: V = new type(...argumentsToBeInjected);
    return instance;
  }

  protected _injectDependenciesIntoInstance(registrationSettings: IRegistrationSettings, instance: any, argumentsToBeInjected: Array<any>): void {

    let propertySource: any;

    if (registrationSettings.isFactory) {

      propertySource = instance;

    } else {

      propertySource = Object.getPrototypeOf(instance);
    }

    const injectionTargetPropertyDescriptor: PropertyDescriptor = getPropertyDescriptor(propertySource, registrationSettings.injectInto);

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

  protected _injectDependenciesIntoFunction(instance: any, targetFunction: any, argumentsToBeInjected: Array<any>): void {
    targetFunction.apply(targetFunction, argumentsToBeInjected);
  }

  protected _injectDependenciesIntoProperty(instance: any, property: string, argumentsToBeInjected: Array<any>): void {
    instance[property] = argumentsToBeInjected;
  }

}
