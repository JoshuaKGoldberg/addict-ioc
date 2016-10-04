define(['exports', './addict-ioc'], function (exports, _addictIoc) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_addictIoc).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _addictIoc[key];
      }
    });
  });
});