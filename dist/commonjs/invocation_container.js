"use strict";
const container_1 = require("./container");
const utils_1 = require("./utils");
class InvocationContainer extends container_1.Container {
    async resolveAsync(key, injectionArgs = [], config) {
        const registration = this.getRegistration(key);
        const resolutionContext = this._createNewResolutionContext(registration);
        const resolvedInstance = await this._resolveAsync(registration, resolutionContext, injectionArgs, config);
        await this._performInvocationsAsync(resolutionContext);
        return resolvedInstance;
    }
    _createNewResolutionContext(registration) {
        const newResolutionContext = super._createNewResolutionContext(registration);
        newResolutionContext.currentResolution.invocations = {};
        return newResolutionContext;
    }
    _createChildResolutionContext(registration, resolutionContext) {
        const newResolutionContext = super._createChildResolutionContext(registration, resolutionContext);
        newResolutionContext.currentResolution.invocations = {};
        return newResolutionContext;
    }
    async _resolveDependencyAsync(registration, dependencyKey, resolutionContext) {
        const resolvedDependency = await super._resolveDependencyAsync(registration, dependencyKey, resolutionContext);
        this._initializeDependencyInvocationContext(registration, dependencyKey, resolutionContext);
        return resolvedDependency;
    }
    _initializeDependencyInvocationContext(registration, dependencyKey, resolutionContext) {
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
    async _performInvocationsAsync(resolutionContext) {
        const calls = this.settings.conventionCalls || this.settings.defaults.conventionCalls;
        if (!calls) {
            return;
        }
        for (let call of calls) {
            for (let instanceId of resolutionContext.instanceResolutionOrder) {
                const instanceWrapper = resolutionContext.instanceLookup[instanceId];
                const invocation = instanceWrapper.invocations[call] || call;
                await utils_1.executeAsExtensionHookAsync(instanceWrapper.instance[invocation], instanceWrapper.instance, []);
            }
        }
    }
}
exports.InvocationContainer = InvocationContainer;

//# sourceMappingURL=invocation_container.js.map
