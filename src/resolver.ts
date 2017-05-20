import {IContainer, ITypeRegistration, IRegistrationSettings, IRegistration, Type, TypeConfig, IResolver} from './interfaces';
import {getPropertyDescriptor} from './utils';

// we need this workaround until TypeScript supports async import() syntax
declare global {
  interface System {
    import (request: string): Promise<any>
  }
  var System: System
}

export class Resolver implements IResolver {

  hash(anything: any): string {
    // if (typeof anything === 'undefined' || anything === null || Array.isArray(anything)) {
    //   return "";
    // }
    return anything;
  }

  hashType<T>(type: Type<T>): string {
    return this.hash(type);
  }

  hashObject(object: any): string {
    return this.hash(object);
  }

  hashFactory(factory: any): string {
    return this.hash(factory);
  }
  
  hashConfig(config: any): string {
    return this.hash(config);
  }

  public resolveType<T>(container: IContainer, registration: ITypeRegistration<T>): Type<T> {
    return registration.settings.type;
  }

  public async resolveTypeAsync<T>(container: IContainer, registration: ITypeRegistration<T>): Promise<Type<T>> {
    return new Promise<Type<T>>((resolve, reject) => {
      resolve(registration.settings.type);
    });
  }

  public resolveObject(container: IContainer, registration: IRegistration): any {
    return registration.settings.object;
  }

  public async resolveObjectAsync(container: IContainer, registration: IRegistration): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      resolve(registration.settings.object);
    });
  }

  public resolveFactory(container: IContainer, registration: IRegistration): any {
    return registration.settings.factory;
  }

  public async resolveFactoryAsync(container: IContainer, registration: IRegistration): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      resolve(registration.settings.factory);
    });
  }

  public resolveConfig(config: TypeConfig): any {
    return config;
  }

  protected _configureInstance(instance: any, config: any) {

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

  public createObject<T>(container: IContainer, object: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    return this._createObject(object, registration, dependencies, injectionArgs);
  }

  protected _createObject<T>(object: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    
    const argumentsToBeInjected = dependencies.concat(injectionArgs);

    if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
      this._injectDependenciesIntoInstance(registration.settings, object, argumentsToBeInjected);
    }

    return object;
  }

  public createFactory<T>(container: IContainer, type: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    return this._createFactory(registration, dependencies, injectionArgs);
  }

  protected _createFactory<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    
    const argumentsToBeInjected = dependencies.concat(injectionArgs);

    if (registration.settings.wantsInjection && !registration.settings.injectInto && injectionArgs.length > 0) {
      return this._createInstanceByFactoryWithInjection<T>(registration.settings.factory, argumentsToBeInjected);
    } 
    
    const instance = this._createInstanceByFactory<T>(registration.settings.factory);
    
    if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
      this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
    }

    return instance;
  }

  public createInstance<T>(container: IContainer, type: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    return this._createInstance(type, registration, dependencies, injectionArgs);
  }

  protected _createInstance<T>(type: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs: Array<any>): T {

    const argumentsToBeInjected = dependencies.concat(injectionArgs);

    if (registration.settings.wantsInjection && !registration.settings.injectInto && argumentsToBeInjected.length > 0) {
      return this._createInstanceByConstructorWithInjection<T>(type, argumentsToBeInjected);
    } 
    
    const instance = this._createInstanceByConstructor<T>(type);
    
    if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
      this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
    }

    return instance;
  }

  protected _createInstanceByFactory<T>(factoryFunction: any): T {
    const instance = factoryFunction();
    return instance;
  }

  protected _createInstanceByFactoryWithInjection<T>(factoryFunction: any, argumentsToBeInjected: Array<any>): T {
    const instance = factoryFunction.apply(undefined, argumentsToBeInjected);
    return instance;
  }

  protected _createInstanceByConstructor<T>(type): T {
    const instance = new type();
    return instance;
  }

  protected _createInstanceByConstructorWithInjection<T>(type, argumentsToBeInjected): T {
    const instance = new type(...argumentsToBeInjected);
    return instance;
  }

  protected _injectDependenciesIntoInstance(registrationSettings: IRegistrationSettings, instance: any, argumentsToBeInjected: Array<any>): void {

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

  protected _injectDependenciesIntoFunction(instance: any, targetFunction: any, argumentsToBeInjected: Array<any>): void {
    targetFunction.apply(targetFunction, argumentsToBeInjected);
  }

  protected _injectDependenciesIntoProperty(instance: any, property: string, argumentsToBeInjected: Array<any>): void {
    instance[property] = argumentsToBeInjected;
  }

}