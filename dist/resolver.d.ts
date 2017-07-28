import { IContainer, IInstanceWrapper, IRegistration, IRegistrationSettings, IResolver, ITypeRegistration, Type, TypeConfig } from './interfaces';
export declare class Resolver<T, U extends IInstanceWrapper<T>> implements IResolver<T, U> {
    hash(anything: any): string;
    hashType<V extends T = T>(type: Type<V>): string;
    hashObject<V extends T = T>(object: V): string;
    hashFactory<V extends T = T>(factory: V): string;
    hashConfig(config: any): string;
    resolveType<V extends T = T>(container: IContainer<U>, registration: ITypeRegistration<V>): Type<V>;
    resolveTypeAsync<V extends T = T>(container: IContainer<U>, registration: ITypeRegistration<V>): Promise<Type<V>>;
    resolveObject(container: IContainer<U>, registration: IRegistration): any;
    resolveObjectAsync(container: IContainer<U>, registration: IRegistration): Promise<any>;
    resolveFactory(container: IContainer<U>, registration: IRegistration): any;
    resolveFactoryAsync(container: IContainer<U>, registration: IRegistration): Promise<any>;
    resolveConfig(config: TypeConfig): any;
    protected _configureInstance(instance: any, config: any): void;
    createObject<V extends T = T>(container: IContainer<U>, object: V, registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs?: Array<any>): V;
    protected _createObject<V extends T = T>(object: V, registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs?: Array<any>): V;
    createFactory<V extends T = T>(container: IContainer<U>, type: V, registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs?: Array<any>): V;
    protected _createFactory<V extends T = T>(registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs?: Array<any>): V;
    createInstance<V extends T = T>(container: IContainer<U>, type: V, registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs?: Array<any>): V;
    protected _createInstance<V extends T = T>(type: any, registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs: Array<any>): V;
    protected _createInstanceByFactory<V extends T = T>(factoryFunction: any): V;
    protected _createInstanceByFactoryWithInjection<V extends T = T>(factoryFunction: any, argumentsToBeInjected: Array<any>): V;
    protected _createInstanceByConstructor<V extends T = T>(type: Type<V>): V;
    protected _createInstanceByConstructorWithInjection<V extends T = T>(type: Type<V>, argumentsToBeInjected: Array<any>): V;
    protected _injectDependenciesIntoInstance(registrationSettings: IRegistrationSettings, instance: any, argumentsToBeInjected: Array<any>): void;
    protected _injectDependenciesIntoFunction(instance: any, targetFunction: any, argumentsToBeInjected: Array<any>): void;
    protected _injectDependenciesIntoProperty(instance: any, property: string, argumentsToBeInjected: Array<any>): void;
}
