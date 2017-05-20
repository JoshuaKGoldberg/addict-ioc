'use strict';

const should = require('should');

const Container = require('./../../../dist/commonjs').Container;

const container = new Container();

class TestType {
  set config(value) {
    this._config = value;
  }
  get config() {
    return this._config;
  }
}

describe('Dependency Injection Container Resolve Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should resolve registration with single dependency', function testCallback() {
    const key = 'test';
    const dependencyKey = 'dependency';
    const config = {
      test: 'this is a test'
    };

    let secondTypeConstructorParam;

    const SecondType = class SecondType {
      constructor(param) {
        secondTypeConstructorParam = param;
      }
      get config() {
        return this._config;
      }
      set config(value) {
        this._config = value;
      }
    };

    container.register(dependencyKey, TestType);

    container.register(key, SecondType)
      .dependencies(dependencyKey)
      .configure(config);

    const resolution = container.resolve(key);

    should(resolution).be.instanceOf(SecondType);
    should(resolution.config).eql(config);
    should(secondTypeConstructorParam).be.instanceOf(TestType);
  });

  it('should resolve registration with multiple dependencies', function testCallback() {
    const key = 'test';
    const firstDependencyKey = 'dependency1';
    const secondDependencyKey = 'dependency2';
    const config = {
      test: 'this is a test'
    };

    let secondTypeConstructorParam;
    let thirdTypeConstructorParam;

    const SecondType = class SecondType {
      constructor(param1, param2) {
        secondTypeConstructorParam = param1;
        thirdTypeConstructorParam = param2;
      }
      get config() {
        return this._config;
      }
      set config(value) {
        this._config = value;
      }
    };

    const ThirdType = class ThirdType {
      constructor() {}
    };

    container.register(firstDependencyKey, TestType);
    container.register(secondDependencyKey, ThirdType);

    container.register(key, SecondType)
      .dependencies(firstDependencyKey, secondDependencyKey)
      .configure(config);

    const resolution = container.resolve(key);

    should(resolution).be.instanceOf(SecondType);
    should(resolution.config).eql(config);
    should(secondTypeConstructorParam).be.instanceOf(TestType);
    should(thirdTypeConstructorParam).be.instanceOf(ThirdType);
  });

  it('should resolve registration without dependencies', function testCallback() {
    const key = 'test';
    const config = {
      test: 'this is a test'
    };

    container.register(key, TestType)
      .configure(config);

    const resolution = container.resolve(key);

    should(resolution).be.instanceOf(TestType);
    should(resolution.config).eql(config);
  });

  it('should resolve registration with overwritten dependency', function testCallback() {

    const SecondType = class SecondType {
      constructor(overwriteType, testType) {
        this._overwriteType = overwriteType;
        this._testType = testType;
      }

      get testType() {
        return this._testType;
      }

      get overwriteType() {
        return this._overwriteType;
      }
    };

    const testConfig = {
      testConfiguration: 'test'
    };

    const OverwriteType = class OverwriteType {};

    const testKey = 'testKey';
    const testKey2 = 'testKey2';
    const overwriteKey = 'overwriteKey';
    const firstKey = 'firstTest';
    const secondKey = 'secondKey';

    container.register(testKey, TestType);

    container.register(testKey2, TestType);

    container.register(overwriteKey, OverwriteType);

    container.register(firstKey, SecondType)
      .dependencies(testKey, testKey2)
      .overwrite(testKey, overwriteKey);


    const first = container.resolve(firstKey);

    should(first.testType).not.be.null();
    should(first.testType).be.instanceOf(TestType);
    should(first.overwriteType).not.be.null();
    should(first.overwriteType).be.instanceOf(OverwriteType);
  });

  it('should resolve with same instance if declared singleton', function testCallback() {

    const SecondType = class SecondType {
      constructor(testType) {
        this._testType = testType;
      }

      get testType() {
        return this._testType;
      }
    };

    const key = 'test';
    const firstKey = 'firstTest';
    const secondKey = 'secondKey';

    container.register(key, TestType)
      .singleton();

    container.register(firstKey, SecondType)
      .dependencies(key);

    container.register(secondKey, SecondType)
      .dependencies(key);


    const first = container.resolve(firstKey);
    const second = container.resolve(secondKey);

    should(first.testType == second.testType).be.true();
  });

  it('should resolve with layered config', function testCallback() {

    const testConfig = {
      one: '1',
      two: '2'
    };

    const key = 'test';

    container.register(key, TestType)
      .configure(testConfig);

    const layeredConfig = {
      two: '5'
    };

    const instance = container.resolve(key, undefined, layeredConfig);

    should(instance.config.one).eql('1');
    should(instance.config.two).eql('5');
  });

  it('should resolve with same instance if declared singleton with config', function testCallback() {

    const SecondType = class SecondType {
      constructor(testType) {
        this._testType = testType;
      }

      get testType() {
        return this._testType;
      }

      get config() {
        return this._config;
      }

      set config(value) {
        this._config = value;
      }
    };

    const testConfig = {
      testConfiguration: 'test'
    };

    const key = 'test';
    const firstKey = 'firstTest';
    const secondKey = 'secondKey';

    container.register(key, TestType)
      .singleton()
      .configure(testConfig);

    container.register(firstKey, SecondType)
      .dependencies(key);

    container.register(secondKey, SecondType)
      .dependencies(key);

    const first = container.resolve(firstKey);
    // testConfig.testConfiguration = 'changed'; // this behavior is not wanted anymore and a false positive test should exist for this // TODO!
    const second = container.resolve(secondKey);

    should(first.testType).equal(second.testType);
    should(first.testType.config).eql(second.testType.config);
  });

  it.skip('should resolve registration with require dependency as relative path', function testCallback() {
    const key = 'test';
    const requiredModule = './test_data/require_type';

    let secondTypeConstructorParam;

    const SecondType = class SecondType {
      constructor(param) {
        secondTypeConstructorParam = param;
      }
    };

    container.setRequire({
      rootPath: __dirname
    });

    container.require(requiredModule);

    container.register(key, SecondType)
      .dependencies(requiredModule);

    const resolution = container.resolve(key);

    const expectedModule = require(requiredModule);
    const instantiatedModule = new expectedModule();

    should(resolution).be.instanceOf(SecondType);
    should(secondTypeConstructorParam).not.eql(expectedModule);
    should(secondTypeConstructorParam).eql(instantiatedModule);
  });

  it.skip('should resolve registration with require dependency as package', function testCallback() {
    const key = 'test';
    const requiredModule = 'fs';

    let secondTypeConstructorParam;

    const SecondType = class SecondType {
      constructor(param) {
        secondTypeConstructorParam = param;
      }
    };

    container.setRequire({
      rootPath: __dirname
    });

    container.require(requiredModule);

    container.register(key, SecondType)
      .dependencies(requiredModule);

    const resolution = container.resolve(key);

    const expectedModule = require(requiredModule);

    should(resolution).be.instanceOf(SecondType);
    should(secondTypeConstructorParam).eql(expectedModule);
  });

  it.skip('should resolve registration with require dependency as relative path by alias', function testCallback() {
    const key = 'test';
    const alias = 'alias';
    const requiredModule = './test_data/require_type';

    let secondTypeConstructorParam;

    const SecondType = class SecondType {
      constructor(param) {
        secondTypeConstructorParam = param;
      }
    };

    container.setRequire({
      rootPath: __dirname
    });

    container.require(requiredModule).as(alias);

    container.register(key, SecondType)
      .dependencies(alias);

    const resolution = container.resolve(key);

    const expectedModule = require(requiredModule);
    const instantiatedModule = new expectedModule();

    should(resolution).be.instanceOf(SecondType);
    should(secondTypeConstructorParam).not.eql(expectedModule);
    should(secondTypeConstructorParam).eql(instantiatedModule);
  });

  it.skip('should resolve registration with require dependency as package by alias', function testCallback() {
    const key = 'test';
    const alias = 'alias';
    const requiredModule = 'fs';

    let secondTypeConstructorParam;

    const SecondType = class SecondType {
      constructor(param) {
        secondTypeConstructorParam = param;
      }
    };

    container.setRequire({
      rootPath: __dirname
    });

    container.require(requiredModule).as(alias);

    container.register(key, SecondType)
      .dependencies(alias);

    const resolution = container.resolve(key);

    const expectedModule = require(requiredModule);

    should(resolution).be.instanceOf(SecondType);
    should(secondTypeConstructorParam).eql(expectedModule);
  });

  it('should resolve self registration (container)', function testCallback() {

    container.initialize();

    const resolution = container.resolve(container.settings.containerRegistrationKey);

    should(resolution).equal(container);
  });

  it.skip('should call single subscriber before resolving new instance', function testCallback() {

    const FirstType = class FirstType {
      constructor(testTypeInstance) {
        this._testTypeInstance = testTypeInstance;
      }

      get testTypeInstance() {
        return this._testTypeInstance;
      }
    };

    const SecondType = class SecondType {

      constructor() {
        this._count = 0;
      }

      get count() {
        return this._count;
      }

      newTestType(testTypeInstance) {

        this._count++;

        if (testTypeInstance) {

          testTypeInstance.count = this._count;

          if (!this._instance) {

            this._instance = testTypeInstance;
          }
        }
        return this._instance;
      }
    };

    const key = 'one';
    const secondKey = 'two';

    container.register(key, FirstType);

    container.register(secondKey, SecondType)
      .onNewInstance(key, 'newTestType');

    const second = container.resolve(secondKey);
    const first = container.resolve(key);
    const anotherFirst = container.resolve(key);

    should(first.count).equal(1);
    should(anotherFirst.count).equal(2);
    should(first === anotherFirst).be.false();

  });

  it.skip('should call multiple subscribers before resolving new instance', function testCallback() {

    const FirstType = class FirstType {
      constructor(testTypeInstance) {
        this._testTypeInstance = testTypeInstance;
        this._countCalled = 0;
      }

      get testTypeInstance() {
        return this._testTypeInstance;
      }

      get countCalled() {
        return this._countCalled;
      }

      get count() {
        return this._count;
      }

      set count(value) {
        this._count = value;
        this._countCalled++;
      }
    };

    const BaseType = class BaseType {

      constructor() {
        this._count = 0;
      }

      get count() {
        return this._count;
      }

      newTestType(testTypeInstance) {

        this._count++;

        if (testTypeInstance) {

          testTypeInstance.count = this._count;

          if (!this._instance) {

            this._instance = testTypeInstance;
          }
        }
        return this._instance;
      }
    };

    const SecondType = class SecondType extends BaseType {
      constructor() {
        super();
      }
    };

    const ThirdType = class ThirdType extends BaseType {
      constructor() {
        super();
      }
    };

    const key = 'one';
    const secondKey = 'two';
    const thirdKey = 'three';

    container.register(key, FirstType);

    container.register(secondKey, SecondType)
      .onNewInstance(key, 'newTestType');

    container.register(thirdKey, ThirdType)
      .onNewInstance(key, 'newTestType');

    const second = container.resolve(secondKey);
    const third = container.resolve(thirdKey);
    const first = container.resolve(key);
    const anotherFirst = container.resolve(key);

    should(second.count).equal(2);
    should(third.count).equal(2);
    should(first.count).equal(1);
    should(first.countCalled).equal(2);
    should(anotherFirst.count).equal(2);
    should(anotherFirst.countCalled).equal(2);
    should(first === anotherFirst).be.false();
  });


    it.skip('should create missing subscriber', function testCallback() {

      const liveLogs = [];

      class FirstType {
        constructor() {
          this._count = 10;
        }

        get count() {
          liveLogs.push(this._count);
          return this._count;
        }

        set count(value) {
          liveLogs.push(value);
          this._count = value;
        }
      }

      const key = 'one';
      const secondKey = 'two';

      container.register(key, FirstType);

      class SecondType {
        constructor() {
          this.count = 0;
        }
        newFirstTypeCreated(firstTypeInstance) {
          this.count++;
          firstTypeInstance.count += 1;
          liveLogs.push(this.count);
        }
      }

      container.register(secondKey, SecondType)
        .onNewInstance(key, 'newFirstTypeCreated');

      const first1 = container.resolve(key);
      const first2 = container.resolve(key);

      const expectedLogs = [10, 11, 1, 10, 11, 2];
      should(liveLogs).eql(expectedLogs);
    });

    it('should resolve lazy registration with runtime parameters', function testCallback() {
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

      should(resolvedInstance.testType.argOne).equal(testRuntimeInjectionArgs[0]);
      should(resolvedInstance.testType.argTwo).equal(testRuntimeInjectionArgs[1]);
      should(resolvedInstance.testType.config).equal(testRuntimeConfig);
    });

});
