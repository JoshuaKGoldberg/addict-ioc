import {Container} from './container';
import {
  ConventionCallType,
  IConventionCall,
  IConventionCalls,
  IFactory,
  IFactoryAsync,
  IFactoryRegistration,
  IInjectConventionCalled,
  IInstanceLookup,
  IInvocationContext,
  IInvocationResolutionContext,
  IInvocationWrapper,
  IObjectRegistration,
  IOverwrittenConventionCalls,
  IRegistration,
  IResolutionContext,
  ITypeRegistration,
  RegistrationKey,
} from './interfaces';
import {executeAsExtensionHook as extensionHook, executeAsExtensionHookAsync as extensionHookAsync} from './utils';

export class InvocationContainer extends Container<IInvocationWrapper<any>> {

  public async resolveAsync<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): Promise<T> {

    const registration: IRegistration = this.getRegistration(key);

    if (!registration) {
      throw new Error(`registration for key "${key}" not found`);
    }

    const resolutionContext: IInvocationResolutionContext<T> = this._createNewResolutionContext<T>(registration);

    const resolvedInstance: T = await this._resolveAsync<T>(registration, resolutionContext, injectionArgs, config);

    await this._performInvocationsAsync<T>(resolutionContext);

    return resolvedInstance;
  }

  public resolve<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): T {

    const registration: IRegistration = this.getRegistration(key);

    if (!registration) {
      throw new Error(`registration for key "${key}" not found`);
    }

    const resolutionContext: IInvocationResolutionContext<T> = this._createNewResolutionContext<T>(registration);

    const resolvedInstance: T = this._resolve<T>(registration, resolutionContext, injectionArgs, config);

    this._performInvocations<T>(resolutionContext);

    return resolvedInstance;
  }

  protected _resolveLazy<T>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<T>, injectionArgs: Array<any> = [], config?: any): IFactory<T> {

    return (lazyInjectionArgs: Array<any>, lazyConfig: any): T => {

      const lazyResolutionContext: IInvocationResolutionContext<T> = this._createChildResolutionContext(registration, resolutionContext);

      const injectionArgsUsed: Array<any> = this._mergeArguments(injectionArgs, lazyInjectionArgs);

      const lazyConfigUsed: any = this._mergeConfigs(config, lazyConfig);

      const resolvedInstance: T = this._resolve<T>(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);

      this._performInvocations<T>(lazyResolutionContext);

      return resolvedInstance;
    };
  }

  protected _resolveLazyAsync<T>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<T>, injectionArgs: Array<any> = [], config?: any): IFactoryAsync<T> {

    return async(lazyInjectionArgs: Array<any>, lazyConfig: any): Promise<T> => {

      const lazyResolutionContext: IInvocationResolutionContext<T> = this._createChildResolutionContext(registration, resolutionContext);

      const injectionArgsUsed: Array<any> = this._mergeArguments(injectionArgs, lazyInjectionArgs);

      const lazyConfigUsed: any = this._mergeConfigs(config, lazyConfig);

      const resolvedInstance: T = await this._resolveAsync<T>(registration, lazyResolutionContext, injectionArgsUsed, lazyConfigUsed);

      await this._performInvocationsAsync<T>(lazyResolutionContext);

      return resolvedInstance;
    };
  }

  protected _createNewResolutionContext<T>(registration: IRegistration): IInvocationResolutionContext<T> {
    const newResolutionContext: IResolutionContext<T, IInvocationWrapper<T>> = super._createNewResolutionContext<T>(registration);
    newResolutionContext.currentResolution.invocations = {};
    return newResolutionContext as IInvocationResolutionContext<T>;
  }

  protected _createChildResolutionContext<T>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<T>): IInvocationResolutionContext<T> {
    const newResolutionContext: IResolutionContext<T, IInvocationWrapper<T>> = super._createChildResolutionContext(registration, resolutionContext);
    newResolutionContext.currentResolution.invocations = {};
    newResolutionContext.currentResolution.registration = registration;
    return newResolutionContext as IInvocationResolutionContext<T>;
  }

  protected async _resolveDependencyAsync<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<T>): Promise<any> {
    const resolvedDependency: T = await super._resolveDependencyAsync(registration, dependencyKey, resolutionContext);
    this._initializeDependencyInvocationContext(registration, dependencyKey, resolutionContext);
    return resolvedDependency;
  }

  protected _resolveDependency<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<T>): any {
    const resolvedDependency: T = super._resolveDependency(registration, dependencyKey, resolutionContext);
    this._initializeDependencyInvocationContext(registration, dependencyKey, resolutionContext);
    return resolvedDependency;
  }

  protected _initializeDependencyInvocationContext<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<T>): void {

    const parentConventionCalls: IOverwrittenConventionCalls = registration.settings.overwrittenConventionCalls;

    const conventionCalls: Array<string> = this.settings.conventionCalls || this.settings.defaults.conventionCalls;

    const invocations: IInvocationContext = {};

    for (const call of conventionCalls) {

      const callOverwritten: string = parentConventionCalls[call];
      const callUsed: string = callOverwritten || call;

      invocations[call] = callUsed;
    }

    resolutionContext.instanceLookup[resolutionContext.currentResolution.id].invocations = invocations;
  }

  protected async _performInvocationsAsync<T>(resolutionContext: IInvocationResolutionContext<T>): Promise<void> {

    const calls: Array<string> = this.settings.conventionCalls || this.settings.defaults.conventionCalls;

    if (!calls || !this._isConventionCallTypeActive(resolutionContext)) {
      return;
    }

    const injectConventionCalled: IInjectConventionCalled = resolutionContext.currentResolution.registration.settings.injectConventionCalled;
    const injectConventionCalledInstances: Array<IInvocationWrapper<T>> = this._getInjectCalledInstances(resolutionContext);

    for (const wrapper of injectConventionCalledInstances) {

      for (const call of calls) {
        await this._performInvocationAsync(resolutionContext, call, wrapper.id);
      }
    }

    for (const call of calls) {

      const instanceResolutionIndex: number = resolutionContext.instanceResolutionOrder.indexOf(resolutionContext.currentResolution);
      const instanceResolutionOrderIds: Array<string> = resolutionContext.instanceResolutionOrder.map((resolution: IInvocationWrapper<any>) => { return resolution.id; });

      // if (instanceResolutionIndex === -1) {
      //   throw new Error('that shouldn`t happen');
      // }

      const instancesToInvoke: Array<string> = instanceResolutionOrderIds.slice(0, instanceResolutionIndex + 1);

      for (const instanceId of instancesToInvoke) {
        await this._performInvocationAsync(resolutionContext, call, instanceId);
      }
    }
  }

  protected async _performInvocationAsync<T>(resolutionContext: IInvocationResolutionContext<T>, call: string, instanceId: string): Promise<void> {

    const instanceWrapper: IInvocationWrapper<T> = resolutionContext.instanceLookup[instanceId];

    if (instanceWrapper.invoked && instanceWrapper.invoked.indexOf(call) !== -1) {
      return;
    } else {

      if (!instanceWrapper.invoked) {
        instanceWrapper.invoked = [];
      }

      instanceWrapper.invoked.push(call);
    }

    const invocation: string = instanceWrapper.invocations[call] || call;

    if (invocation === call) {
      console.log(`invoking "${invocation}" on key "${instanceWrapper.registration.settings.key}" (instance: ${instanceId})`);
    } else {
      console.log(`invoking "${invocation}" instead of "${call}" on key "${instanceWrapper.registration.settings.key}" (instance: ${instanceId})`);
    }

    await extensionHook(instanceWrapper.instance[invocation], instanceWrapper.instance, []);
  }

  private _isConventionCallTypeActive<T>(resolutionContext: IInvocationResolutionContext<T>): boolean {

    const registration: IRegistration = resolutionContext.currentResolution.registration;

    if (registration.settings.isFactory) {
      return this.settings.conventionCallTypes.indexOf(ConventionCallType.Factory) !== -1;
    }

    if (registration.settings.isObject) {
      return this.settings.conventionCallTypes.indexOf(ConventionCallType.Object) !== -1;
    }

    return this.settings.conventionCallTypes.indexOf(ConventionCallType.Class) !== -1;
  }

  protected _performInvocations<T>(resolutionContext: IInvocationResolutionContext<T>): void {

    const calls: Array<string> = this.settings.conventionCalls || this.settings.defaults.conventionCalls;

    if (!calls || !this._isConventionCallTypeActive(resolutionContext)) {
      return;
    }

    const injectConventionCalled: IInjectConventionCalled = resolutionContext.currentResolution.registration.settings.injectConventionCalled;
    const injectConventionCalledInstances: Array<IInvocationWrapper<T>> = this._getInjectCalledInstances(resolutionContext);

    for (const wrapper of injectConventionCalledInstances) {

      for (const call of calls) {
        this._performInvocation(resolutionContext, call, wrapper.id);
      }
    }

    for (const call of calls) {

      const isConventionCalled: boolean = !!injectConventionCalled[call];

      if (isConventionCalled) {
        continue;
      }

      const instanceResolutionIndex: number = resolutionContext.instanceResolutionOrder.indexOf(resolutionContext.currentResolution);
      const instanceResolutionOrderIds: Array<string> = resolutionContext.instanceResolutionOrder.map((resolution: IInvocationWrapper<any>) => { return resolution.id; });

      // if (instanceResolutionIndex === -1) {
      //   throw new Error('that shouldn`t happen');
      // }

      const instancesToInvoke: Array<string> = instanceResolutionOrderIds.slice(0, instanceResolutionIndex + 1);

      for (const instanceId of instancesToInvoke) {
        this._performInvocation(resolutionContext, call, instanceId);
      }
    }
  }

  protected _performInvocation<T>(resolutionContext: IInvocationResolutionContext<T>, call: string, instanceId: string): void {

    const instanceWrapper: IInvocationWrapper<T> = resolutionContext.instanceLookup[instanceId];

    if (instanceWrapper.invoked && instanceWrapper.invoked.indexOf(call) !== -1) {
      return;
    } else {

      if (!instanceWrapper.invoked) {
        instanceWrapper.invoked = [];
      }

      instanceWrapper.invoked.push(call);
    }

    const invocation: string = instanceWrapper.invocations[call] || call;

    if (invocation === call) {
      console.log(`invoking "${invocation}" on key "${instanceWrapper.registration.settings.key}" (instance: ${instanceId})`);
    } else {
      console.log(`invoking "${invocation}" instead of "${call}" on key "${instanceWrapper.registration.settings.key}" (instance: ${instanceId})`);
    }

    extensionHook(instanceWrapper.instance[invocation], instanceWrapper.instance, []);
  }

  private _getInjectCalledInstances<T>(resolutionContext: IInvocationResolutionContext<T>): Array<IInvocationWrapper<T>> {

    const injectConventionCalled: IInjectConventionCalled = resolutionContext.currentResolution.registration.settings.injectConventionCalled;

    const result: Array<IInvocationWrapper<T>> = [];

    for (const registrationKey in injectConventionCalled) {

      for (const resolution of resolutionContext.instanceResolutionOrder) {

        const wrapper: IInvocationWrapper<T> = resolutionContext.instanceLookup[resolution.id];

        if (wrapper.registration.settings.key === registrationKey) {
          result.push(wrapper);
        }
      }
    }

    return result;
  }

}
