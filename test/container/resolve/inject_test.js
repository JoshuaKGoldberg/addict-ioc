'use strict';

const should = require('should');

const container = require('./../../../lib/container');

const TestType = class TestType {
  constructor() {}
  set config(value) {
    this._config = value;
  }
  get config() {
    return this._config;
  }
}

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

    const resolvedLazyWrapper = secondTypeConstructorParam();

    should(resolution).be.instanceOf(SecondType);
    should(resolution.config).equal(config);
    should(typeof secondTypeConstructorParam).equal('function');
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
    }

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


  it('should inject into into named properties if set', function testCallback() {
    const key = 'test';
    const dependencyKey = 'dependencyOne';
    const secondDependencyKey = 'dependencyTwo';

    const SecondType = class SecondType {
      get dependency() {
        return this._dependency;
      }
      set dependency(value) {
        this._dependency = value;
      }
        get secondDependency() {
          return this._secondDependency;
        }
        set secondDependency(value) {
          this._secondDependency = value;
        }
    };

    const ThirdType = class ThirdType {}

    container.register(dependencyKey, TestType);

    container.register(secondDependencyKey, ThirdType);

    const registration = container.register(key, SecondType)
      .dependencies(dependencyKey, secondDependencyKey);

    registration.settings.namedPropertyInjection = true;

    const resolvedDependencies = container.resolveDependencies(key);

    const resolvedKey = container.resolve(key);

    should(resolvedKey.dependencyOne).not.be.null();
    should(resolvedKey.dependencyOne).be.instanceOf(TestType);
    should(typeof resolvedDependencies[0] == typeof resolvedKey.dependencyOne).be.ok();

    should(resolvedKey.dependencyTwo).not.be.null();
    should(resolvedKey.dependencyTwo).be.instanceOf(TestType);
    should(typeof resolvedDependencies[1] == typeof resolvedKey.dependencyTwo).be.ok();
  });
});
