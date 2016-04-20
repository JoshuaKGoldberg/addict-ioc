'use strict';

const should = require('should');

const container = require('./../../../lib/container');

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
    should(resolution.config).equal(config);
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
    should(resolution.config).equal(config);
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
    should(resolution.config).equal(config);
  });

  it('should resolve registration with single dependency declared as type', function testCallback() {
    const key = 'test';
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

    container.register(TestType);

    container.register(key, SecondType)
      .dependencies(TestType)
      .configure(config);

    const resolution = container.resolve(key);

    should(resolution).be.instanceOf(SecondType);
    should(resolution.config).equal(config);
    should(secondTypeConstructorParam).be.instanceOf(TestType);
  });

  it('should resolve with same instance if declared singleton', function testCallback() {

    const SecondType = class SecondType {
      constructor(testType) {
        this._testType = testType;
      }

      get testType() {
        return this._testType;
      }
    }

    container.register(TestType)
      .singleton();

    const firstKey = 'firstTest';
    const secondKey = 'secondKey';

    container.register(firstKey, SecondType)
      .dependencies(TestType);

    container.register(secondKey, SecondType)
      .dependencies(TestType);


    const first = container.resolve(firstKey);
    const second = container.resolve(secondKey);

    should(first.testType === second.testType).be.true();
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
    }

    const testConfig = {
      testConfiguration: 'test'
    };

    container.register(TestType)
      .singleton()
      .configure(testConfig);

    const firstKey = 'firstTest';
    const secondKey = 'secondKey';

    container.register(firstKey, SecondType)
      .dependencies(TestType);

    container.register(secondKey, SecondType)
      .dependencies(TestType);


    const first = container.resolve(firstKey);
    testConfig.testConfiguration = 'changed';
    const second = container.resolve(secondKey);

    should(first.testType === second.testType).be.true();
    should(first.config === second.config).be.true();
  });

  it('should call single subscriber before resolving new instance', function testCallback() {

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
    }

    container.register(FirstType);

    container.register(SecondType)
      .onNewInstance(FirstType, 'newTestType');

    const second = container.resolve(SecondType);
    const first = container.resolve(FirstType);
    const anotherFirst = container.resolve(FirstType);

    should(first.count).equal(1);
    should(anotherFirst.count).equal(2);
    should(first === anotherFirst).be.false();

  });

  it('should call multiple subscribers before resolving new instance', function testCallback() {

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
    }

    const SecondType = class SecondType extends BaseType {
      constructor() {
        super();
      }
    }

    const ThirdType = class ThirdType extends BaseType {
      constructor() {
        super();
      }
    }

    container.register(FirstType);

    container.register(SecondType)
      .onNewInstance(FirstType, 'newTestType');

    container.register(ThirdType)
      .onNewInstance(FirstType, 'newTestType');

    const second = container.resolve(SecondType);
    const third = container.resolve(ThirdType);
    const first = container.resolve(FirstType);
    const anotherFirst = container.resolve(FirstType);

    should(second.count).equal(2);
    should(third.count).equal(2);
    should(first.count).equal(1);
    should(first.countCalled).equal(2);
    should(anotherFirst.count).equal(2);
    should(anotherFirst.countCalled).equal(2);
    should(first === anotherFirst).be.false();
  });

});