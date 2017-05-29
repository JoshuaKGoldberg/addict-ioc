import { Container } from './container';
import { ITypeRegistration, RegistrationKey, IInvocationResolutionContext, IInvocationWrapper, IRegistration } from "./interfaces";
export declare class InvocationContainer extends Container<IInvocationWrapper<any>> {
    resolveAsync<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): Promise<T>;
    protected _createNewResolutionContext<T>(registration: IRegistration): IInvocationResolutionContext<T>;
    protected _createChildResolutionContext<T>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<T>): IInvocationResolutionContext<T>;
    protected _resolveDependencyAsync<T>(registration: ITypeRegistration<T>, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<T>): Promise<any>;
    protected _initializeDependencyInvocationContext<T>(registration: ITypeRegistration<T>, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<T>): void;
    protected _performInvocationsAsync<T>(resolutionContext: IInvocationResolutionContext<T>): Promise<void>;
}
