import {Container} from './container';
import {executeAsExtensionHookAsync as extensionHookAsync, executeAsExtensionHook as extensionHook} from './utils';
import { ITypeRegistration, IResolutionContext, IInvocationContext, RegistrationKey, IObjectRegistration, IFactoryRegistration, IInvocationResolutionContext, IInvocationWrapper, IRegistration, IFactory, IFactoryAsync } from "./interfaces";

export class InvocationContainer extends Container<IInvocationWrapper<any>> {

  public async resolveAsync<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): Promise<T> {

    const registration = this.getRegistration<T>(key);
    const resolutionContext = this._createNewResolutionContext<T>(registration);

    const resolvedInstance = await this._resolveAsync<T>(registration, resolutionContext, injectionArgs, config);
  
    await this._performInvocationsAsync<T>(resolutionContext);

    return resolvedInstance;
  }

  public resolve<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): T {

    const registration = this.getRegistration<T>(key);
    const resolutionContext = this._createNewResolutionContext<T>(registration);

    const resolvedInstance = this._resolve<T>(registration, resolutionContext, injectionArgs, config);

    this._performInvocations<T>(resolutionContext);

    return resolvedInstance;
  }



  protected _resolveLazy<T>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<T>, injectionArgs: Array<any> = [], config?: any): IFactory<T> {

    return (lazyInjectionArgs: Array<any>, lazyConfig: any): T => {

      const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);

      const lazyConfigUsed = this._mergeConfigs(config, lazyConfig);

      const resolvedInstance = this._resolve<T>(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);

      this._performInvocations<T>(resolutionContext);

      return resolvedInstance;
    };
  }

  protected _resolveLazyAsync<T>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<T>, injectionArgs: Array<any> = [], config?: any): IFactoryAsync<T> {

    return async (lazyInjectionArgs: Array<any>, lazyConfig: any): Promise<T> => {

      const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);

      const lazyConfigUsed = this._mergeConfigs(config, lazyConfig);

      const resolvedInstance = this._resolveAsync<T>(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);

      await this._performInvocationsAsync<T>(resolutionContext);

      return resolvedInstance;
    };
  }



  protected _createNewResolutionContext<T>(registration: IRegistration): IInvocationResolutionContext<T> {
    const newResolutionContext = super._createNewResolutionContext<T>(registration);
    newResolutionContext.currentResolution.invocations = {};
    return newResolutionContext as IInvocationResolutionContext<T>;
  }

  protected _createChildResolutionContext<T>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<T>): IInvocationResolutionContext<T> {
    const newResolutionContext = super._createChildResolutionContext(registration, resolutionContext);
    newResolutionContext.currentResolution.invocations = {};
    return newResolutionContext as IInvocationResolutionContext<T>;
  }

  protected async _resolveDependencyAsync<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<T>): Promise<any> {
    const resolvedDependency = await super._resolveDependencyAsync(registration, dependencyKey, resolutionContext);
    this._initializeDependencyInvocationContext(registration, dependencyKey, resolutionContext);
    return resolvedDependency;
  }

  protected _resolveDependency<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<T>): any {
    const resolvedDependency = super._resolveDependency(registration, dependencyKey, resolutionContext);
    this._initializeDependencyInvocationContext(registration, dependencyKey, resolutionContext);
    return resolvedDependency;
  }

  protected _initializeDependencyInvocationContext<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<T>): void {
    
    const parentConventionCalls = registration.settings.conventionCalls[dependencyKey] || {};

    const conventionCalls = this.settings.conventionCalls || this.settings.defaults.conventionCalls;
    const invocations = {};

    for (let call of conventionCalls) {

      const callOverwritten = parentConventionCalls[call];
      const callUsed = callOverwritten || call;

      invocations[call] = callUsed;
    }

    resolutionContext.instanceLookup[resolutionContext.currentResolution.id].invocations = invocations;
  }

  protected async _performInvocationsAsync<T>(resolutionContext: IInvocationResolutionContext<T>): Promise<void> {

    const calls = this.settings.conventionCalls || this.settings.defaults.conventionCalls;

    if (!calls) {
      return;
    }

    for (let call of calls) {

      for (let instanceId of resolutionContext.instanceResolutionOrder) {

        const instanceWrapper = resolutionContext.instanceLookup[instanceId];

        const invocation = instanceWrapper.invocations[call] || call;

        await extensionHook(instanceWrapper.instance[invocation], instanceWrapper.instance, []);
      }
    }
  }

  protected _performInvocations<T>(resolutionContext: IInvocationResolutionContext<T>): void {

    const calls = this.settings.conventionCalls || this.settings.defaults.conventionCalls;

    if (!calls) {
      return;
    }

    for (let call of calls) {

      for (let instanceId of resolutionContext.instanceResolutionOrder) {

        const instanceWrapper = resolutionContext.instanceLookup[instanceId];

        const invocation = instanceWrapper.invocations[call] || call;

        extensionHook(instanceWrapper.instance[invocation], instanceWrapper.instance, []);
      }
    }
  }
  
}