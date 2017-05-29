import { Container } from './container';
import { RegistrationKey, IInvocationResolutionContext, IInvocationWrapper, IRegistration, IFactory, IFactoryAsync } from "./interfaces";
export declare class InvocationContainer extends Container<IInvocationWrapper<any>> {
    resolveAsync<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): Promise<T>;
    resolve<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): T;
    protected _resolveLazy<T>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<T>, injectionArgs?: Array<any>, config?: any): IFactory<T>;
    protected _resolveLazyAsync<T>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<T>, injectionArgs?: Array<any>, config?: any): IFactoryAsync<T>;
    protected _createNewResolutionContext<T>(registration: IRegistration): IInvocationResolutionContext<T>;
    protected _createChildResolutionContext<T>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<T>): IInvocationResolutionContext<T>;
    protected _resolveDependencyAsync<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<T>): Promise<any>;
    protected _resolveDependency<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<T>): any;
    protected _initializeDependencyInvocationContext<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<T>): void;
    protected _performInvocationsAsync<T>(resolutionContext: IInvocationResolutionContext<T>): Promise<void>;
    protected _performInvocations<T>(resolutionContext: IInvocationResolutionContext<T>): void;
}
