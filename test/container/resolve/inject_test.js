'use strict';

const should = require('should');

const Container = require('./../../../dist/commonjs').Container;

const container = new Container();

const TestType = class TestType {
  constructor() {}
  set config(value) {
    this._config = value;
  }
  get config() {
    return this._config;
  }
};

describe('Dependency Injection Container Resolve Injection Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should inject into target function if declared', function testCallback() {
    const key = 'test';
    const dependencyKey = 'dependency';
    const config = {
      test: 'this is a test'
    };

    let injectedDependency;

    const SecondType = class SecondType {
      constructor() {}
      get config() {
        return this._config;
      }
      set config(value) {
        this._config = value;
      }
      injectionTargetProperty(firstDependency) {
        injectedDependency = firstDependency;
      }
    };

    container.register(dependencyKey, TestType);

    container.register(key, SecondType)
      .dependencies(dependencyKey)
      .injectInto('injectionTargetProperty')
      .configure(config);

    const resolvedDependencies = container.resolveDependencies(key);

    const resolvedKey = container.resolve(key);

    should(injectedDependency).not.be.null();
    should(injectedDependency).be.instanceOf(TestType);
    should(typeof resolvedDependencies[0] == typeof injectedDependency).be.ok();
  });

  it('should inject into target setter if declared', function testCallback() {
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
      get injectionTargetProperty() {
        return this._injectionTargetProperty;
      }
      set injectionTargetProperty(value) {
        this._injectionTargetProperty = value;
      }
    };

    container.register(dependencyKey, TestType);

    container.register(key, SecondType)
      .dependencies(dependencyKey)
      .injectInto('injectionTargetProperty')
      .configure(config);

    const resolvedDependencies = container.resolveDependencies(key);

    const resolvedKey = container.resolve(key);

    should(resolvedKey.injectionTargetProperty[0]).not.be.null();
    should(resolvedKey.injectionTargetProperty[0]).be.instanceOf(TestType);
    should(typeof resolvedDependencies[0] == typeof resolvedKey.injectionTargetProperty[0]).be.ok();
  });

  it('should inject wrapper function if dependencies are declared lazy', function testCallback() {
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
      .configure(config)
      .injectLazy();

    const resolution = container.resolve(key);

    should(typeof secondTypeConstructorParam).equal('function');

    const resolvedLazyWrapper = secondTypeConstructorParam();

    should(resolution).be.instanceOf(SecondType);
    should(resolution.config).equal(config);
    should(secondTypeConstructorParam).not.be.instanceOf(TestType);
    should(resolvedLazyWrapper).be.instanceOf(TestType);
  });

  it('should inject same instance multiple times if dependencies contains dependency declared singleton multiple times', function testCallback() {

    const key = 'test';
    const dependencyKey = 'dependency';
    const config = {
      test: 'this is a test'
    };

    let firstInjectedDependency;
    let secondInjectedDependency;

    const FirstType = class FirstType {
      constructor() {}
      set config(value) {
        this._config = value;
      }
      get config() {
        return this._config;
      }
    };

    const SecondType = class SecondType {
      constructor() {}
      get config() {
        return this._config;
      }
      set config(value) {
        this._config = value;
      }
      injectionTargetProperty(firstDependency, secondDependency) {
        firstInjectedDependency = firstDependency;
        secondInjectedDependency = secondDependency;
      }
    };

    container.register(dependencyKey, FirstType)
      .singleton();

    container.register(key, SecondType)
      .dependencies(dependencyKey, dependencyKey)
      .injectInto('injectionTargetProperty')
      .configure(config);

    const resolvedDependency = container.resolve(dependencyKey);
    const resolvedKey = container.resolve(key);

    should(firstInjectedDependency).not.be.null();
    should(secondInjectedDependency).not.be.null();
    should(resolvedDependency).not.be.null();

    should(resolvedDependency).be.instanceOf(FirstType);

    should(resolvedDependency === firstInjectedDependency).be.ok();
    should(resolvedDependency === secondInjectedDependency).be.ok();
  });
});

it.only('should inject dependencies mixed with args', function testCallback() {
  const key = 'test';
  const dependencyKey = 'dependency';
  const config = {
    test: 'this is a test'
  };

  const SecondType = class SecondType {
    constructor(firstDependency, eins, zwei) {
      this._injectedDependency = firstDependency;
      this._eins = eins;
      this._zwei = zwei;
    }
    get injectedDependency() {
      return this._injectedDependency;
    }
    get eins() {
      return this._eins;
    }
    get zwei() {
      return this._zwei;
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

  const testArgs = [
    '1',
    '2'
  ];

  const resolvedKey = container.resolve(key, testArgs, undefined);

  should(resolvedKey.injectedDependency).not.be.null();
  should(resolvedKey.injectedDependency).be.instanceOf(TestType);
  should(resolvedKey.eins).not.be.undefined();
  should(resolvedKey.eins).equal(testArgs[0]);
  should(resolvedKey.zwei).not.be.undefined();
  should(resolvedKey.zwei).equal(testArgs[1]);

});
