import { IContainer, IInstanceWrapper, IRegistration, IRegistrationSettings, IResolver, ITypeRegistration, Type, TypeConfig } from './interfaces';
import {getPropertyDescriptor} from './utils';

export class Resolver<TType, TInstanceWrapper extends IInstanceWrapper<TType>> implements IResolver<TType, TInstanceWrapper> {

  public hash(anything: any): string {
    // if (typeof anything === 'undefined' || anything === null || Array.isArray(anything)) {
    //   return "";
    // }
    if (!anything) {
      return anything;
    }
    return JSON.stringify(anything);
  }

  public hashType<TExtendedType extends TType = TType>(type: Type<TExtendedType>): string {
    return this.hash(type);
  }

  public hashObject<TExtendedType extends TType = TType>(object: TExtendedType): string {
    return this.hash(object);
  }

  public hashFactory<TExtendedType extends TType = TType>(factory: TExtendedType): string {
    return this.hash(factory);
  }

  public hashConfig(config: any): string {
    return this.hash(config);
  }

  public resolveType<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, registration: ITypeRegistration<TExtendedType>): Type<TExtendedType> {
    return registration.settings.type;
  }

  public async resolveTypeAsync<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, registration: ITypeRegistration<TExtendedType>): Promise<Type<TExtendedType>> {
    if (registration.settings.module) {
      const module: any = await import(registration.settings.module);
      return module[registration.settings.key];
    }
    return registration.settings.type;
  }

  public resolveObject<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, registration: IRegistration): TExtendedType {
    return registration.settings.object;
  }

  public async resolveObjectAsync<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, registration: IRegistration): Promise<TExtendedType> {
    if (registration.settings.module) {
      const module: any = await import(registration.settings.module);
      return module[registration.settings.key];
    }
    return registration.settings.object;
  }

  public resolveFactory<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, registration: IRegistration): TExtendedType {
    return registration.settings.factory;
  }

  public async resolveFactoryAsync<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, registration: IRegistration): Promise<TExtendedType> {
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

  public createObject<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, object: TExtendedType, registration: ITypeRegistration<TExtendedType>, dependencies: Array<any>, injectionArgs?: Array<any>): TExtendedType {
    return this._createObject<TExtendedType>(object, registration, dependencies, injectionArgs);
  }

  protected _createObject<TExtendedType extends TType = TType>(object: TExtendedType, registration: ITypeRegistration<TExtendedType>, dependencies: Array<any>, injectionArgs?: Array<any>): TExtendedType {

    const argumentsToBeInjected: Array<any> = dependencies.concat(injectionArgs);

    if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
      this._injectDependenciesIntoInstance(registration.settings, object, argumentsToBeInjected);
    }

    return object;
  }

  public createFactory<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, type: TExtendedType, registration: ITypeRegistration<TExtendedType>, dependencies: Array<any>, injectionArgs?: Array<any>): TExtendedType {
    return this._createFactory(registration, dependencies, injectionArgs);
  }

  protected _createFactory<TExtendedType extends TType = TType>(registration: ITypeRegistration<TExtendedType>, dependencies: Array<any>, injectionArgs?: Array<any>): TExtendedType {

    const argumentsToBeInjected: Array<any> = dependencies.concat(injectionArgs);

    if (registration.settings.wantsInjection && !registration.settings.injectInto && injectionArgs.length > 0) {
      return this._createInstanceByFactoryWithInjection<TExtendedType>(registration.settings.factory, argumentsToBeInjected);
    }

    const instance: TExtendedType = this._createInstanceByFactory<TExtendedType>(registration.settings.factory);

    if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
      this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
    }

    return instance;
  }

  public createInstance<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, type: TExtendedType, registration: ITypeRegistration<TExtendedType>, dependencies: Array<any>, injectionArgs?: Array<any>): TExtendedType {
    return this._createInstance(type, registration, dependencies, injectionArgs);
  }

  protected _createInstance<TExtendedType extends TType = TType>(type: any, registration: ITypeRegistration<TExtendedType>, dependencies: Array<any>, injectionArgs: Array<any>): TExtendedType {

    const argumentsToBeInjected: Array<any> = dependencies.concat(injectionArgs);

    if (registration.settings.wantsInjection && !registration.settings.injectInto && argumentsToBeInjected.length > 0) {
      return this._createInstanceByConstructorWithInjection<TExtendedType>(type, argumentsToBeInjected);
    }

    const instance: TExtendedType = this._createInstanceByConstructor<TExtendedType>(type);

    if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
      this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
    }

    return instance;
  }

  protected _createInstanceByFactory<TExtendedType extends TType = TType>(factoryFunction: any): TExtendedType {
    const instance: TExtendedType = factoryFunction();
    return instance;
  }

  protected _createInstanceByFactoryWithInjection<TExtendedType extends TType = TType>(factoryFunction: any, argumentsToBeInjected: Array<any>): TExtendedType {
    const instance: TExtendedType = factoryFunction.apply(undefined, argumentsToBeInjected);
    return instance;
  }

  protected _createInstanceByConstructor<TExtendedType extends TType = TType>(type: Type<TExtendedType>): TExtendedType {
    const instance: TExtendedType = new type();
    return instance;
  }

  protected _createInstanceByConstructorWithInjection<TExtendedType extends TType = TType>(type: Type<TExtendedType>, argumentsToBeInjected: Array<any>): TExtendedType {
    const instance: TExtendedType = new type(...argumentsToBeInjected);
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
