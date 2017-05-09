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
