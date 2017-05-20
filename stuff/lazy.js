'use strict';

const Container = require('./../dist/commonjs').Container;

const container = new Container();

class TestType {
  set config(value) {
    this._config = value;
  }
  get config() {
    return this._config;
  }
}

      const testKey = 'test';
      const secondKey = 'second';
      const testRuntimeInjectionArgs = ['1', '2'];
      const testRuntimeConfig = {
        test: 'config'
      };

      class SecondType {
        constructor(testTypeLazy) {
          this._testType = testTypeLazy(testRuntimeInjectionArgs, testRuntimeConfig);
        }

        get testType() {
          return this._testType;
        }
      }

      class ThirdType {
        constructor(argOne, argTwo) {
          this._argOne = argOne;
          this._argTwo = argTwo;
        }

        get argOne() {
          return this._argOne;
        }

        get argTwo() {
          return this._argTwo;
        }

        get config() {
          return this._config;
        }

        set config(value) {
          this._config = value;
        }
      }

      container.register(testKey, ThirdType);

      container.register(secondKey, SecondType)
        .dependencies(testKey)
        .injectLazy();

      const resolvedInstance = container.resolve(secondKey);
