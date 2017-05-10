import {IContainer, ITypeRegistration, IRegistrationSettings, IRegistration, Type, TypeConfig, ITypeResolver} from './interfaces';
import {getPropertyDescriptor} from './utils';

// we need this workaround until TypeScript supports async import() syntax
declare global {
  interface System {
    import (request: string): Promise<any>
  }
  var System: System
}

export class Resolver implements ITypeResolver {

  public resolveType<T>(container: IContainer, registration: ITypeRegistration<T>): Type<T> {

    const type = registration.settings.type;

    if (type) {
      return type;
    }

    try {

      if (!registration.settings.module) {
        throw new Error(`Cannot resolve missing type for key ${registration.settings.key}: module is missing`);
      }

      const module = require(registration.settings.module);

      if (!module) {
        throw new Error(`Cannot resolve missing type for key ${registration.settings.key}: could not load module`);
      }

      return this._extractTypeFromModule(module, registration);

    } catch (error) {

      throw new Error(`Cannot resolve missing type for key ${registration.settings.key}: ${error}`);
    }
  }

  public async resolveTypeAsync<T>(container: IContainer, registration: ITypeRegistration<T>): Promise<Type<T>> {

    if (registration.settings.type) {

      return registration.settings.type;

    } else {
      
      try {

        if (!registration.settings.module) {
          throw new Error(`Cannot resolve missing type for key ${registration.settings.key}: module is missing`);
        }

        const module = await System.import(registration.settings.module);

        if (!module) {
          throw new Error(`Cannot resolve missing type for key ${registration.settings.key}: could not load module`);
        }
        
        return this._extractTypeFromModule(module, registration);

      } catch (error) {

        throw new Error(`Cannot resolve missing type for key ${registration.settings.key}: ${error}`);
      }
    }
  }

  public resolveConfig(config: TypeConfig): any {
    return config;
  }

  protected _extractTypeFromModule<T>(module: any, registration: ITypeRegistration<T>): Type<T> {

    const type = module[registration.settings.key];

    if (!type) {
      throw new Error(`Cannot resolve missing type for key ${registration.settings.key}: type not found in module`);
    }

    registration.settings.type = type;
    
    return type;
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

  public createObject<T>(container: IContainer, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    return this._createObject(registration, dependencies, injectionArgs);
  }

  protected _createObject<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    
    const object = registration.settings.object;
    const argumentsToBeInjected = dependencies.concat(injectionArgs);

    if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
      this._injectDependenciesIntoInstance(registration.settings, object, argumentsToBeInjected);
    }

    return object;
  }

  public createFactory<T>(container: IContainer, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
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

  public createInstance<T>(container: IContainer, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    return this._createInstance(registration, dependencies, injectionArgs);
  }

  protected _createInstance<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs: Array<any>): T {

    const argumentsToBeInjected = dependencies.concat(injectionArgs);

    if (registration.settings.wantsInjection && !registration.settings.injectInto && injectionArgs.length > 0) {
      return this._createInstanceByConstructorWithInjection<T>(registration.settings.factory, argumentsToBeInjected);
    } 
    
    const instance = this._createInstanceByConstructor<T>(registration.settings.type);
    
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