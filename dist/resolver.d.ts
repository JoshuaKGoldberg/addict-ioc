import { IContainer, ITypeRegistration, Type, TypeConfig, ITypeResolver } from './interfaces';
export declare class Resolver implements ITypeResolver {
    resolveType<T>(container: IContainer, registration: ITypeRegistration<T>): Type<T>;
    resolveConfig(config: TypeConfig): any;
    private _configureInstance(instance, config);
    createInstance<T>(container: IContainer, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
    private _createInstance<T>(registration, dependencies, injectionArgs);
    private _createInstanceByFactory(type);
    private _createInstanceByFactoryWithInjection(type, argumentsToBeInjected);
    private _createInstanceByConstructor(type);
    private _createInstanceByConstructorWithInjection(type, argumentsToBeInjected);
    private _injectDependenciesIntoInstance(registrationSettings, instance, argumentsToBeInjected);
    private _injectDependenciesIntoFunction(instance, targetFunction, argumentsToBeInjected);
    private _injectDependenciesIntoProperty(instance, property, argumentsToBeInjected);
}
