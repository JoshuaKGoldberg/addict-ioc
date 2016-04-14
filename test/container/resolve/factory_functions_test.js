'use strict';

const should = require('should');

const container = require('./../../../lib/container.js');

class TestType {}

describe('Dependency Injection Container Resolve Factory Function Test', function describeCallback() {

  it('should resolve factory function without dependencies', function testCallback() {
    const key = 'test';
    const factory = () => {
      return {
        test: () => {}
      }
    }

    const referenceInstance = factory();

    container.registerFactory(key, factory);

    const resolution = container.resolve(key);

    should(resolution).eql(referenceInstance);
  });

  it('should resolve factory function with single dependency', function testCallback() {
    const key = 'test';

    const factory = (firstParam) => {
      return {
        test: () => {
          return firstParam;
        }
      }
    }


    const TestType = class TestType {
      constructor() {}
    }
    container.register(TestType);

    container.registerFactory(key, factory)
      .dependencies(TestType);

    const resolution = container.resolve(key);

    const injectedParam = resolution.test();
    should(injectedParam).not.be.null();
    should(injectedParam).be.instanceOf(TestType);
  });

  it('should inject into target function if declared', function testCallback() {
    const key = 'test';

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
      }
    }


    const TestType = class TestType {
      constructor() {}
    }
    container.register(TestType);

    container.registerFactory(key, factory)
      .dependencies(TestType)
      .injectInto('secondTest');

    const resolution = container.resolve(key);

    const injectedParam = resolution.test();
    should(injectedParam).be.undefined();
    const realInjectedParam = resolution.thirdTest();
    should(realInjectedParam).not.be.null();
    should(realInjectedParam).be.instanceOf(TestType);


  });

  it('should resolve factory function with multiple dependencies', function testCallback() {
    const key = 'test';

    const factory = (firstParam, secondParam) => {
      return {
        test: () => {
          return firstParam;
        },
        secondTest: () => {
          return secondParam;
        }
      }
    }

    const TestType = class TestType {
      constructor() {}
    }
    container.register(TestType);
    const SecondType = class SecondType {
      constructor() {}
    }
    container.register(SecondType);

    container.registerFactory(key, factory)
      .dependencies(TestType, SecondType);

    const resolution = container.resolve(key);

    const firstInjectedParam = resolution.test();
    const secondInjectedParam = resolution.secondTest();
    should(firstInjectedParam).not.be.null();
    should(firstInjectedParam).be.instanceOf(TestType);
    should(secondInjectedParam).not.be.null();
    should(secondInjectedParam).be.instanceOf(SecondType);
  });
});
