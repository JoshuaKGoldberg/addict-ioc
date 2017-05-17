import { IContainer, ITypeRegistration, IRegistrationSettings, IRegistration, Type, TypeConfig, ITypeResolver } from './interfaces';
declare global  {
    interface System {
        import(request: string): Promise<any>;
    }
    var System: System;
}
export declare class Resolver implements ITypeResolver {
    resolveType<T>(container: IContainer, registration: ITypeRegistration<T>): Type<T>;
    resolveTypeAsync<T>(container: IContainer, registration: ITypeRegistration<T>): Promise<Type<T>>;
    resolveObject(container: IContainer, registration: IRegistration): any;
    resolveObjectAsync(container: IContainer, registration: IRegistration): Promise<any>;
    resolveFactory(container: IContainer, registration: IRegistration): any;
    resolveFactoryAsync(container: IContainer, registration: IRegistration): Promise<any>;
    resolveConfig(config: TypeConfig): any;
    protected _configureInstance(instance: any, config: any): void;
    createObject<T>(container: IContainer, object: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
    protected _createObject<T>(object: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
    createFactory<T>(container: IContainer, type: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
    protected _createFactory<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
    createInstance<T>(container: IContainer, type: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
    protected _createInstance<T>(type: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs: Array<any>): T;
    protected _createInstanceByFactory<T>(factoryFunction: any): T;
    protected _createInstanceByFactoryWithInjection<T>(factoryFunction: any, argumentsToBeInjected: Array<any>): T;
    protected _createInstanceByConstructor<T>(type: any): T;
    protected _createInstanceByConstructorWithInjection<T>(type: any, argumentsToBeInjected: any): T;
    protected _injectDependenciesIntoInstance(registrationSettings: IRegistrationSettings, instance: any, argumentsToBeInjected: Array<any>): void;
    protected _injectDependenciesIntoFunction(instance: any, targetFunction: any, argumentsToBeInjected: Array<any>): void;
    protected _injectDependenciesIntoProperty(instance: any, property: string, argumentsToBeInjected: Array<any>): void;
}
