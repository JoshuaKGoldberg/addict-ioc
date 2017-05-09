System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ResolutionContext;
    return {
        setters: [],
        execute: function () {
            ResolutionContext = (function () {
                function ResolutionContext(registration) {
                    this.registration = registration;
                    this.history = [];
                    this.owners = {};
                }
                return ResolutionContext;
            }());
            exports_1("ResolutionContext", ResolutionContext);
        }
    };
});

//# sourceMappingURL=resolution_context.js.map
