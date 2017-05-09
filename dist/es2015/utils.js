export function getPropertyDescriptor(type, key) {
    var propertyDescriptor = Object.getOwnPropertyDescriptor(type, key);
    if (propertyDescriptor) {
        return propertyDescriptor;
    }
    var prototype = Object.getPrototypeOf(type);
    if (!prototype) {
        return undefined;
    }
    return getPropertyDescriptor(prototype, key);
}

//# sourceMappingURL=utils.js.map
