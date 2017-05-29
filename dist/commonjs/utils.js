"use strict";
const BluebirdPromise = require("bluebird");
function getPropertyDescriptor(type, key) {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(type, key);
    if (propertyDescriptor) {
        return propertyDescriptor;
    }
    const prototype = Object.getPrototypeOf(type);
    if (!prototype) {
        return undefined;
    }
    return getPropertyDescriptor(prototype, key);
}
exports.getPropertyDescriptor = getPropertyDescriptor;
function executeAsExtensionHookAsync(func, thisContext, args) {
    return new BluebirdPromise((resolve, reject) => {
        if (isValidFunction(func)) {
            const funcReturn = func.call(thisContext, args);
            resolve(funcReturn);
        }
        else {
            resolve();
        }
    });
}
exports.executeAsExtensionHookAsync = executeAsExtensionHookAsync;
function executeAsExtensionHook(func, thisContext, args) {
    if (isValidFunction(func)) {
        return func.call(thisContext, args);
    }
}
exports.executeAsExtensionHook = executeAsExtensionHook;
function isValidFunction(func) {
    return func && typeof func === 'function';
}

//# sourceMappingURL=utils.js.map
