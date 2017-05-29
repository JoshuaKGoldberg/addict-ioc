import { IRegistry, IFactoryRegistration, IObjectRegistration, IInstanceCache, IContainer, RegistrationKey, IRegistration, IResolver, IContainerSettings, IResolutionContext, ITypeRegistration, IFactory, IFactoryAsync, IValidationError, IInstanceWrapper } from './interfaces';
import { Registry } from './registry';
export declare class Container<U extends IInstanceWrapper<any>> extends Registry implements IContainer<U> {
    instances: IInstanceCache<any, U>;
    settings: IContainerSettings;
    parentContainer: IContainer<any>;
    constructor(settings?: IContainerSettings, parentContainer?: IContainer<any>, parentRegistry?: IRegistry);
    initialize(): void;
    clear(): void;
    protected _orderDependencies(registration: IRegistration, results: Array<RegistrationKey>, missing: Array<RegistrationKey>, recursive: Array<Array<RegistrationKey>>, nest?: Array<RegistrationKey>): void;
    protected _createNewResolutionContext<T>(registration: IRegistration): IResolutionContext<T, U>;
    resolve<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): T;
    resolveAsync<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): Promise<T>;
    protected _resolve<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): T;
    protected _resolveAsync<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): Promise<T>;
    resolveLazy<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): IFactory<T>;
    resolveLazyAsync<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): IFactoryAsync<T>;
    protected _resolveLazy<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): IFactory<T>;
    protected _resolveLazyAsync<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): IFactoryAsync<T>;
    protected _resolveObject<T>(registration: IObjectRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): T;
    protected _resolveObjectAsync<T>(registration: IObjectRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): Promise<any>;
    protected _resolveFactory<T>(registration: IFactoryRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): T;
    protected _resolveFactoryAsync<T>(registration: IFactoryRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): Promise<T>;
    protected _resolveTypeInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): T;
    protected _resolveTypeInstanceAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): Promise<T>;
    protected _getTypeInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): T;
    protected _getTypeInstanceAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): Promise<T>;
    protected _getNewTypeInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): T;
    protected _getNewTypeInstanceAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): Promise<T>;
    protected _validateResolutionContext<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>): void;
    protected _resolveDependencies<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>): Array<any>;
    protected _resolveDependenciesAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>): Promise<Array<any>>;
    protected _resolveDependency<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IResolutionContext<T, U>): any;
    protected _resolveDependencyAsync<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IResolutionContext<T, U>): Promise<any>;
    protected _createObject<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
    protected _createObjectAsync<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): Promise<any>;
    protected _createFactory<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
    protected _createFactoryAsync<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): Promise<any>;
    protected _createType<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
    protected _createTypeAsync<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): Promise<T>;
    protected _getResolver<T>(registration: IRegistration): IResolver<T, U>;
    protected _configureInstance(instance: any, registration: IRegistration, runtimeConfig?: any): void;
    protected _getCachedInstances<T>(registration: IRegistration, injectionArgs: Array<any>, config: any): Array<T>;
    protected _createInstanceId(): string;
    protected _cacheInstance<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>, instance: any, injectionArgs: Array<any>, config: any): void;
    validateDependencies(...keys: Array<RegistrationKey>): Array<IValidationError>;
    protected _validateDependencies(keys: Array<RegistrationKey>, history?: Array<IRegistration>): Array<IValidationError>;
    protected _validateDependency(registration: IRegistration, dependency: IRegistration, history: Array<IRegistration>): any[];
    protected _historyHasCircularBreak(history: Array<IRegistration>, dependency: IRegistration): boolean;
    protected _createValidationError(registration: IRegistration, history: Array<IRegistration>, errorMessage: string): IValidationError;
    protected _validateOverwrittenKeys(registration: IRegistration, history: Array<IRegistration>): Array<IValidationError>;
    protected _validateOverwrittenKey(registration: IRegistration, overwrittenKey: RegistrationKey, history: Array<IRegistration>): Array<IValidationError>;
    protected _mergeArguments(existingArgs?: Array<any>, newArgs?: Array<any>): Array<any>;
    protected _mergeConfigs(existingConfig: any, newConfig: any): any;
    protected _mergeRegistrationConfig<T>(registration: ITypeRegistration<T>, config?: any): any;
    protected _resolveConfig<T>(registration: IRegistration, config: any): any;
    protected _createChildResolutionContext<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>): IResolutionContext<T, U>;
    protected _cloneResolutionContext<T>(resolutionContext: IResolutionContext<T, U>): IResolutionContext<T, U>;
    protected _isDependencyLazy<T>(registration: IRegistration, dependencyKey: RegistrationKey): boolean;
    protected _isDependencyLazyAsync<T>(registration: IRegistration, dependencyKey: RegistrationKey): boolean;
    protected _isDependencyOwned<T>(registration: IRegistration, dependencyKey: RegistrationKey): boolean;
    protected _getDependencyKeyOverwritten(registration: IRegistration, dependencyKey: RegistrationKey): string;
}
