define(["require", "exports"], function (require, exports) {
    "use strict";
    var TypeRegistration = (function () {
        function TypeRegistration(settings) {
            this._settings = this._ensureSettings(settings);
        }
        TypeRegistration.prototype._ensureSettings = function (settings) {
            var baseSettings = {
                overwrittenKeys: {},
                tags: {}
            };
            return Object.assign(baseSettings, settings);
        };
        Object.defineProperty(TypeRegistration.prototype, "settings", {
            get: function () {
                return this._settings;
            },
            enumerable: true,
            configurable: true
        });
        TypeRegistration.prototype.configure = function (config) {
            this.settings.config = config;
            return this;
        };
        TypeRegistration.prototype.dependencies = function () {
            var dependencies = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                dependencies[_i] = arguments[_i];
            }
            this.settings.dependencies = dependencies;
            return this;
        };
        TypeRegistration.prototype.singleton = function (isSingleton) {
            if (isSingleton === void 0) { isSingleton = true; }
            this.settings.isSingleton = isSingleton;
            return this;
        };
        TypeRegistration.prototype.injectLazy = function () {
            var lazyDependencies = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                lazyDependencies[_i] = arguments[_i];
            }
            this.settings.lazyDependencies = lazyDependencies;
            return this;
        };
        TypeRegistration.prototype.injectPromiseLazy = function () {
            var lazyPromiseDependencies = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                lazyPromiseDependencies[_i] = arguments[_i];
            }
            this.settings.lazyPromiseDependencies = lazyPromiseDependencies;
            return this;
        };
        TypeRegistration.prototype.injectInto = function (targetFunction) {
            this.settings.injectInto = targetFunction;
            return this;
        };
        TypeRegistration.prototype.bindFunctions = function () {
            var functionsToBind = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                functionsToBind[_i] = arguments[_i];
            }
            this.settings.functionsToBind = functionsToBind;
            return this;
        };
        TypeRegistration.prototype.tags = function () {
            var _this = this;
            var tags = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                tags[_i] = arguments[_i];
            }
            tags.forEach(function (tag) {
                if (!_this.settings.tags[tag]) {
                    _this.settings.tags[tag] = {};
                }
            });
            return this;
        };
        TypeRegistration.prototype.setTag = function (tag, value) {
            this.settings.tags[tag] = value;
            return this;
        };
        TypeRegistration.prototype.overwrite = function (originalKey, overwrittenKey) {
            this.settings.overwrittenKeys[originalKey] = overwrittenKey;
            return this;
        };
        TypeRegistration.prototype.owns = function () {
            var ownedDependencies = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                ownedDependencies[_i] = arguments[_i];
            }
            this.settings.ownedDependencies = ownedDependencies;
            return this;
        };
        TypeRegistration.prototype.hasTags = function (tagOrTags) {
            var declaredTags = Object.keys(this.settings.tags);
            var tags = Array.isArray(tagOrTags) ? tagOrTags : [tagOrTags];
            var isTagMissing = tags.some(function (tag) {
                if (declaredTags.indexOf(tag) < 0) {
                    return true;
                }
            });
            return !isTagMissing;
        };
        return TypeRegistration;
    }());
    exports.TypeRegistration = TypeRegistration;
});

//# sourceMappingURL=type_registration.js.map
