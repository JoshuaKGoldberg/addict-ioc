import { IRegistry, IInstanceCache, IContainer, RegistrationKey, IContainerSettings, IFactory, IFactoryAsync, IValidationError } from './interfaces';
import { Registry } from './registry';
export declare class Container extends Registry implements IContainer {
    instances: IInstanceCache<any>;
    settings: IContainerSettings;
    parentContainer: IContainer;
    constructor(settings?: IContainerSettings, parentContainer?: IContainer, parentRegistry?: IRegistry);
    initialize(): void;
    clear(): void;
    resolve<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): T;
    resolveAsync<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): Promise<T>;
    resolveLazy<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): IFactory<T>;
    resolveLazyAsync<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): IFactoryAsync<T>;
    private _resolveLazy<T>(registration, resolutionContext, injectionArgs?, config?);
    private _resolveLazyAsync<T>(registration, resolutionContext, injectionArgs?, config?);
    private _resolveObject<T>(registration, resolutionContext, injectionArgs?, config?);
    private _resolveFactory<T>(registration, resolutionContext, injectionArgs?, config?);
    private _resolveInstance<T>(registration, resolutionContext, injectionArgs?, config?);
    private _resolveInstanceAsync<T>(registration, resolutionContext, injectionArgs?, config?);
    private _getInstance<T>(registration, resolutionContext, injectionArgs?, config?);
    private _getInstanceAsync<T>(registration, resolutionContext, injectionArgs?, config?);
    private _getNewInstance<T>(registration, resolutionContext, injectionArgs?, config?);
    private _getNewInstanceAsync<T>(registration, resolutionContext, injectionArgs?, config?);
    private _validateResolutionContext<T>(registration, resolutionContext);
    private _resolveDependencies<T>(registration, resolutionContext);
    private _resolveDependenciesAsync<T>(registration, resolutionContext);
    private _resolveDependency<T>(registration, dependencyKey, resolutionContext);
    private _resolveDependencyAsync<T>(registration, dependencyKey, resolutionContext);
    private _createObject<T>(registration, dependencies, injectionArgs?);
    private _createFactory<T>(registration, dependencies, injectionArgs?);
    private _createInstance<T>(registration, dependencies, injectionArgs?);
    private _createInstanceAsync<T>(registration, dependencies, injectionArgs?);
    private _getResolver<T>(registration);
    private _configureInstance(instance, config);
    private _getCachedInstances<T>(registration, injectionArgs, config);
    private _cacheInstance<T>(registration, instance, injectionArgs, config);
    validateDependencies(...keys: Array<RegistrationKey>): Array<IValidationError>;
    private _validateDependencies(keys, history?);
    private _validateDependency(registration, dependency, history);
    private _historyHasCircularBreak(history, dependency);
    private _createValidationError(registration, history, errorMessage);
    private _validateOverwrittenKeys(registration, history);
    private _validateOverwrittenKey(registration, overwrittenKey, history);
    private _hashConfig(config);
    private _hashInjectionArgs(injectionArgs);
    private _hashObject(object);
    private _createNewResolutionContext<T>(registration);
    private _mergeArguments(existingArgs?, newArgs?);
    private _mergeConfigs(existingConfig, newConfig);
    private _mergeRegistrationConfig<T>(registration, config?);
    private _resolveConfig<T>(registration, config);
    private _createChildResolutionContext<T>(registration, resolutionContext);
    private _cloneResolutionContext<T>(resolutionContext);
    private _isDependencyLazy<T>(registration, dependencyKey);
    private _isDependencyLazyAsync<T>(registration, dependencyKey);
    private _isDependencyOwned<T>(registration, dependencyKey);
    private _getDependencyKeyOverwritten(registration, dependencyKey);
}
