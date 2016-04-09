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

  it.skip('should resolve with same instance if declared singleton', function testCallback() {
  });

  it.skip('should call single subscriber before resolving new instance', function testCallback() {
  });

  it.skip('should call multiple subscribers before resolving new instance', function testCallback() {
  });

});
