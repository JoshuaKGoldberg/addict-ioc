System.register(["./container", "./default_settings", "./registration_context", "./registry", "./resolution_context", "./resolver", "./registration", "./registration_settings", "./utils"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters: [
            function (container_1_1) {
                exportStar_1(container_1_1);
            },
            function (default_settings_1_1) {
                exportStar_1(default_settings_1_1);
            },
            function (registration_context_1_1) {
                exportStar_1(registration_context_1_1);
            },
            function (registry_1_1) {
                exportStar_1(registry_1_1);
            },
            function (resolution_context_1_1) {
                exportStar_1(resolution_context_1_1);
            },
            function (resolver_1_1) {
                exportStar_1(resolver_1_1);
            },
            function (registration_1_1) {
                exportStar_1(registration_1_1);
            },
            function (registration_settings_1_1) {
                exportStar_1(registration_settings_1_1);
            },
            function (utils_1_1) {
                exportStar_1(utils_1_1);
            }
        ],
        execute: function () {
        }
    };
});

//# sourceMappingURL=index.js.map
