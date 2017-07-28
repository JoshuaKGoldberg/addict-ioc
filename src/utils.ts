import * as BluebirdPromise from 'bluebird';
export function getPropertyDescriptor(type: any, key: string): PropertyDescriptor {

  const propertyDescriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(type, key);

  if (propertyDescriptor) {
    return propertyDescriptor;
  }

  const prototype: any = Object.getPrototypeOf(type);

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

export function executeAsExtensionHook(func: any, thisContext: any, args?: Array<any>): void {
  if (isValidFunction(func)) {
    return func.call(thisContext, args);
  }
}

function isValidFunction(func: any): boolean {
  return func && typeof func === 'function';
}
