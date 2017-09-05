import { Container } from './container';
import { IFactory, IFactoryAsync, IInvocationResolutionContext, IInvocationWrapper, IRegistration, RegistrationKey } from './interfaces';
export declare class InvocationContainer extends Container<IInvocationWrapper<any>> {
    resolveAsync<TType>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): Promise<TType>;
    resolve<TType>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): TType;
    protected _resolveLazy<TType>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<TType>, injectionArgs?: Array<any>, config?: any): IFactory<TType>;
    protected _resolveLazyAsync<TType>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<TType>, injectionArgs?: Array<any>, config?: any): IFactoryAsync<TType>;
    protected _createNewResolutionContext<TType>(registration: IRegistration): IInvocationResolutionContext<TType>;
    protected _createChildResolutionContext<TType>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<TType>): IInvocationResolutionContext<TType>;
    protected _resolveDependencyAsync<TType>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<TType>): Promise<any>;
    protected _resolveDependency<TType>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<TType>): any;
    protected _initializeDependencyInvocationContext<TType>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<TType>): void;
    protected _performInvocationsAsync<TType>(resolutionContext: IInvocationResolutionContext<TType>): Promise<void>;
    protected _performInvocationAsync<TType>(resolutionContext: IInvocationResolutionContext<TType>, call: string, instanceId: string): Promise<void>;
    private _isConventionCallTypeActive<TType>(resolutionContext);
    protected _performInvocations<TType>(resolutionContext: IInvocationResolutionContext<TType>): void;
    protected _performInvocation<TType>(resolutionContext: IInvocationResolutionContext<TType>, call: string, instanceId: string): void;
    private _getInjectCalledInstances<TType>(resolutionContext);
}
