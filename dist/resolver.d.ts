import { IContainer, IInstanceWrapper, IRegistration, IRegistrationSettings, IResolver, ITypeRegistration, Type, TypeConfig } from './interfaces';
export declare class Resolver<TType, TInstanceWrapper extends IInstanceWrapper<TType>> implements IResolver<TType, TInstanceWrapper> {
    hash(anything: any): string;
    hashType<TExtendedType extends TType = TType>(type: Type<TExtendedType>): string;
    hashObject<TExtendedType extends TType = TType>(object: TExtendedType): string;
    hashFactory<TExtendedType extends TType = TType>(factory: TExtendedType): string;
    hashConfig(config: any): string;
    resolveType<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, registration: ITypeRegistration<TExtendedType>): Type<TExtendedType>;
    resolveTypeAsync<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, registration: ITypeRegistration<TExtendedType>): Promise<Type<TExtendedType>>;
    resolveObject<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, registration: IRegistration): TExtendedType;
    resolveObjectAsync<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, registration: IRegistration): Promise<TExtendedType>;
    resolveFactory<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, registration: IRegistration): TExtendedType;
    resolveFactoryAsync<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, registration: IRegistration): Promise<TExtendedType>;
    resolveConfig(config: TypeConfig): any;
    protected _configureInstance(instance: any, config: any): void;
    createObject<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, object: TExtendedType, registration: ITypeRegistration<TExtendedType>, dependencies: Array<any>, injectionArgs?: Array<any>): TExtendedType;
    protected _createObject<TExtendedType extends TType = TType>(object: TExtendedType, registration: ITypeRegistration<TExtendedType>, dependencies: Array<any>, injectionArgs?: Array<any>): TExtendedType;
    createFactory<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, type: TExtendedType, registration: ITypeRegistration<TExtendedType>, dependencies: Array<any>, injectionArgs?: Array<any>): TExtendedType;
    protected _createFactory<TExtendedType extends TType = TType>(registration: ITypeRegistration<TExtendedType>, dependencies: Array<any>, injectionArgs?: Array<any>): TExtendedType;
    createInstance<TExtendedType extends TType = TType>(container: IContainer<TInstanceWrapper>, type: TExtendedType, registration: ITypeRegistration<TExtendedType>, dependencies: Array<any>, injectionArgs?: Array<any>): TExtendedType;
    protected _createInstance<TExtendedType extends TType = TType>(type: any, registration: ITypeRegistration<TExtendedType>, dependencies: Array<any>, injectionArgs: Array<any>): TExtendedType;
    protected _createInstanceByFactory<TExtendedType extends TType = TType>(factoryFunction: any): TExtendedType;
    protected _createInstanceByFactoryWithInjection<TExtendedType extends TType = TType>(factoryFunction: any, argumentsToBeInjected: Array<any>): TExtendedType;
    protected _createInstanceByConstructor<TExtendedType extends TType = TType>(type: Type<TExtendedType>): TExtendedType;
    protected _createInstanceByConstructorWithInjection<TExtendedType extends TType = TType>(type: Type<TExtendedType>, argumentsToBeInjected: Array<any>): TExtendedType;
    protected _injectDependenciesIntoInstance(registrationSettings: IRegistrationSettings, instance: any, argumentsToBeInjected: Array<any>): void;
    protected _injectDependenciesIntoFunction(instance: any, targetFunction: any, argumentsToBeInjected: Array<any>): void;
    protected _injectDependenciesIntoProperty(instance: any, property: string, argumentsToBeInjected: Array<any>): void;
}
