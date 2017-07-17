"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var container_1 = require("./container");
var utils_1 = require("./utils");
var InvocationContainer = (function (_super) {
    __extends(InvocationContainer, _super);
    function InvocationContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InvocationContainer.prototype.resolveAsync = function (key, injectionArgs, config) {
        if (injectionArgs === void 0) { injectionArgs = []; }
        return __awaiter(this, void 0, void 0, function () {
            var registration, resolutionContext, resolvedInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        registration = this.getRegistration(key);
                        resolutionContext = this._createNewResolutionContext(registration);
                        return [4 /*yield*/, this._resolveAsync(registration, resolutionContext, injectionArgs, config)];
                    case 1:
                        resolvedInstance = _a.sent();
                        return [4 /*yield*/, this._performInvocationsAsync(resolutionContext)];
                    case 2:
                        _a.sent();
                        console.log(resolutionContext);
                        return [2 /*return*/, resolvedInstance];
                }
            });
        });
    };
    InvocationContainer.prototype.resolve = function (key, injectionArgs, config) {
        if (injectionArgs === void 0) { injectionArgs = []; }
        var registration = this.getRegistration(key);
        var resolutionContext = this._createNewResolutionContext(registration);
        var resolvedInstance = this._resolve(registration, resolutionContext, injectionArgs, config);
        this._performInvocations(resolutionContext);
        console.log(resolutionContext);
        return resolvedInstance;
    };
    InvocationContainer.prototype._resolveLazy = function (registration, resolutionContext, injectionArgs, config) {
        var _this = this;
        if (injectionArgs === void 0) { injectionArgs = []; }
        return function (lazyInjectionArgs, lazyConfig) {
            var injectionArgsUsed = _this._mergeArguments(injectionArgs, lazyInjectionArgs);
            var lazyConfigUsed = _this._mergeConfigs(config, lazyConfig);
            var resolvedInstance = _this._resolve(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
            _this._performInvocations(resolutionContext);
            return resolvedInstance;
        };
    };
    InvocationContainer.prototype._resolveLazyAsync = function (registration, resolutionContext, injectionArgs, config) {
        var _this = this;
        if (injectionArgs === void 0) { injectionArgs = []; }
        return function (lazyInjectionArgs, lazyConfig) { return __awaiter(_this, void 0, void 0, function () {
            var injectionArgsUsed, lazyConfigUsed, resolvedInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);
                        lazyConfigUsed = this._mergeConfigs(config, lazyConfig);
                        resolvedInstance = this._resolveAsync(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
                        return [4 /*yield*/, this._performInvocationsAsync(resolutionContext)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, resolvedInstance];
                }
            });
        }); };
    };
    InvocationContainer.prototype._createNewResolutionContext = function (registration) {
        var newResolutionContext = _super.prototype._createNewResolutionContext.call(this, registration);
        newResolutionContext.currentResolution.invocations = {};
        return newResolutionContext;
    };
    InvocationContainer.prototype._createChildResolutionContext = function (registration, resolutionContext) {
        var newResolutionContext = _super.prototype._createChildResolutionContext.call(this, registration, resolutionContext);
        newResolutionContext.currentResolution.invocations = {};
        return newResolutionContext;
    };
    InvocationContainer.prototype._resolveDependencyAsync = function (registration, dependencyKey, resolutionContext) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvedDependency;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype._resolveDependencyAsync.call(this, registration, dependencyKey, resolutionContext)];
                    case 1:
                        resolvedDependency = _a.sent();
                        this._initializeDependencyInvocationContext(registration, dependencyKey, resolutionContext);
                        return [2 /*return*/, resolvedDependency];
                }
            });
        });
    };
    InvocationContainer.prototype._resolveDependency = function (registration, dependencyKey, resolutionContext) {
        var resolvedDependency = _super.prototype._resolveDependency.call(this, registration, dependencyKey, resolutionContext);
        this._initializeDependencyInvocationContext(registration, dependencyKey, resolutionContext);
        return resolvedDependency;
    };
    InvocationContainer.prototype._initializeDependencyInvocationContext = function (registration, dependencyKey, resolutionContext) {
        var parentConventionCalls = registration.settings.conventionCalls[dependencyKey];
        var conventionCalls = this.settings.conventionCalls || this.settings.defaults.conventionCalls;
        var invocations = {};
        if (!parentConventionCalls) {
            invocations = conventionCalls;
        }
        else {
            for (var _i = 0, conventionCalls_1 = conventionCalls; _i < conventionCalls_1.length; _i++) {
                var call = conventionCalls_1[_i];
                var callOverwritten = parentConventionCalls[call];
                var callUsed = callOverwritten || call;
                invocations[call] = callUsed;
            }
        }
        resolutionContext.instanceLookup[resolutionContext.currentResolution.id].invocations = invocations;
    };
    InvocationContainer.prototype._performInvocationsAsync = function (resolutionContext) {
        return __awaiter(this, void 0, void 0, function () {
            var calls, _i, calls_1, call, _a, _b, instanceId, instanceWrapper, invocation;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        calls = this.settings.conventionCalls || this.settings.defaults.conventionCalls;
                        if (!calls) {
                            return [2 /*return*/];
                        }
                        _i = 0, calls_1 = calls;
                        _c.label = 1;
                    case 1:
                        if (!(_i < calls_1.length)) return [3 /*break*/, 6];
                        call = calls_1[_i];
                        _a = 0, _b = resolutionContext.instanceResolutionOrder;
                        _c.label = 2;
                    case 2:
                        if (!(_a < _b.length)) return [3 /*break*/, 5];
                        instanceId = _b[_a];
                        instanceWrapper = resolutionContext.instanceLookup[instanceId];
                        invocation = instanceWrapper.invocations[call] || call;
                        return [4 /*yield*/, utils_1.executeAsExtensionHook(instanceWrapper.instance[invocation], instanceWrapper.instance, [])];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _a++;
                        return [3 /*break*/, 2];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    InvocationContainer.prototype._performInvocations = function (resolutionContext) {
        var calls = this.settings.conventionCalls || this.settings.defaults.conventionCalls;
        if (!calls) {
            return;
        }
        for (var _i = 0, calls_2 = calls; _i < calls_2.length; _i++) {
            var call = calls_2[_i];
            var instanceResolutionIndex = resolutionContext.instanceResolutionOrder.indexOf(resolutionContext.currentResolution.id);
            if (instanceResolutionIndex === -1) {
                throw new Error('that shouldn`t happen');
            }
            var instancesToInvoke = resolutionContext.instanceResolutionOrder.slice(0, instanceResolutionIndex);
            for (var _a = 0, instancesToInvoke_1 = instancesToInvoke; _a < instancesToInvoke_1.length; _a++) {
                var instanceId = instancesToInvoke_1[_a];
                var instanceWrapper = resolutionContext.instanceLookup[instanceId];
                if (instanceWrapper.invoked.indexOf(call) === -1) {
                    continue;
                }
                else {
                    instanceWrapper.invoked.push(call);
                }
                var invocation = instanceWrapper.invocations[call] || call;
                utils_1.executeAsExtensionHook(instanceWrapper.instance[invocation], instanceWrapper.instance, []);
            }
        }
    };
    return InvocationContainer;
}(container_1.Container));
exports.InvocationContainer = InvocationContainer;

//# sourceMappingURL=invocation_container.js.map
