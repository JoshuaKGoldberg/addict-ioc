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

  it.skip('should inject same instance multiple times if dependencies contains dependency declared singleton multiple times', function testCallback() {
  });

});
