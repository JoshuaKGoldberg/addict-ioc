System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function getPropertyDescriptor(type, key) {
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
    exports_1("getPropertyDescriptor", getPropertyDescriptor);
    return {
        setters: [],
        execute: function () {
        }
    };
});

//# sourceMappingURL=utils.js.map
