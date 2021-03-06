'use strict';

const should = require('should');

const container = require('./../../../lib/container.js');

const TestType = class TestType {
  constructor() {}
  set config(value) {
    this._config = value;
  }
  get config() {
    return this._config;
  }
};

describe('Dependency Injection Container Resolve Factory Function Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should resolve factory function without dependencies', function testCallback() {
    const key = 'test';
    const factory = () => {
      return {
        test: () => {}
      };
    };

    const referenceInstance = factory();

    container.registerFactory(key, factory);

    const resolution = container.resolve(key);

    should(resolution).eql(referenceInstance);
  });

  it('should resolve factory function with single dependency', function testCallback() {
    const key = 'one';
    const secondKey = 'two';

    const factory = (firstParam) => {
      return {
        test: () => {
          return firstParam;
        }
      };
    };

    container.register(key, TestType);

    container.registerFactory(secondKey, factory)
      .dependencies(key);

    const resolution = container.resolve(secondKey);

    const injectedParam = resolution.test();
    should(injectedParam).not.be.null();
    should(injectedParam).be.instanceOf(TestType);
  });

  it('should inject into target function if declared', function testCallback() {
    const key = 'one';
    const secondKey = 'two';

    const factory = (firstParam) => {
      return {
        test: () => {
          return firstParam;
        },
        secondTest: (secondParam) => {
          this.secondParam = secondParam;
        },
        thirdTest: () => {
          return this.secondParam;
        }
      };
    };

    container.register(key, TestType);

    container.registerFactory(secondKey, factory)
      .dependencies(key)
      .injectInto('secondTest');

    const resolution = container.resolve(secondKey);

    const injectedParam = resolution.test();
    should(injectedParam).be.undefined();
    const realInjectedParam = resolution.thirdTest();
    should(realInjectedParam).not.be.null();
    should(realInjectedParam).be.instanceOf(TestType);


  });

  it('should resolve factory function with multiple dependencies', function testCallback() {
    const key = 'one';
    const secondKey = 'two';
    const thirdKey = 'three';

    const factory = (firstParam, secondParam) => {
      return {
        test: () => {
          return firstParam;
        },
        secondTest: () => {
          return secondParam;
        }
      };
    };

    container.register(key, TestType);

    const SecondType = class SecondType {
      constructor() {}
      set config(value) {
        this._config = value;
      }
      get config() {
        return this._config;
      }
    };

    container.register(secondKey, SecondType);

    container.registerFactory(thirdKey, factory)
      .dependencies(key, secondKey);

    const resolution = container.resolve(thirdKey);

    const firstInjectedParam = resolution.test();
    const secondInjectedParam = resolution.secondTest();
    should(firstInjectedParam).not.be.null();
    should(firstInjectedParam).be.instanceOf(TestType);
    should(secondInjectedParam).not.be.null();
    should(secondInjectedParam).be.instanceOf(SecondType);
  });
});
