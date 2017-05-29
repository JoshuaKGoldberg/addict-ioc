import * as BluebirdPromise from 'bluebird';
export function getPropertyDescriptor(type: any, key: string) {

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


export function executeAsExtensionHookAsync(func: any, thisContext: any, args?: any): Promise<any> {

  return new BluebirdPromise((resolve, reject) => {

    if (isValidFunction(func)) {

      const funcReturn = func.call(thisContext, args);

      resolve(funcReturn);

    } else {

      resolve();
    }

  });
}

function isValidFunction(func) {
  return func && typeof func === 'function';
}