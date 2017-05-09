import { IContainer, RegistrationKey, IContainerSettings } from './interfaces';
import { Registry } from './registry';
export interface IInstanceCache<T> extends Map<RegistrationKey, IInstanceWithConfigCache<T>> {
}
export interface IInstanceWithConfigCache<T> extends Map<string, IInstanceWithInjectionArgsCache<T>> {
}
export interface IInstanceWithInjectionArgsCache<T> extends Map<string, Array<T>> {
}
export declare class Container extends Registry implements IContainer {
    instances: IInstanceCache<any>;
    parentContainer: IContainer;
    settings: IContainerSettings;
    constructor(parentContainer?: IContainer, settings?: IContainerSettings);
    clear(): void;
    initialize(): void;
    resolve<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): T;
    private _mergeArguments(existingArgs?, newArgs?);
    private _mergeConfigs(existingConfig, newConfig);
    private _resolve<T>(registration, resolutionContext, injectionArgs?, config?);
    private _resolveLazy<T>(registration, resolutionContext, injectionArgs?, config?);
    private _resolveConfig<T>(registration, config);
    private _resolveInstance<T>(registration, resolutionContext, injectionArgs?, config?);
    private _getInstance<T>(registration, resolutionContext, injectionArgs?, config?);
    private _getNewInstance<T>(registration, resolutionContext, injectionArgs?, config?);
    private _getNewInstanceResolutionContext<T>(registration, resolutionContext);
    private _cloneResolutionContext<T>(resolutionContext);
    private _validateResolutionContext<T>(resolutionContext);
    private _resolveDependencies<T>(registration, resolutionContext);
    private _resolveDependency<T>(registration, dependencyKey, resolutionContext);
    private _isDependencyLazy<T>(registration, dependencyKey);
    private _createInstance<T>(registration, dependencies, injectionArgs?);
    private _getResolver<T>(registration);
    private _configureInstance(instance, config);
    private _getCachedInstances<T>(registration, injectionArgs, config);
    private _cacheInstance<T>(registration, instance, injectionArgs, config);
    private _hashConfig(config);
    private _hashInjectionArgs(injectionArgs);
    private _hashObject(object);
}
