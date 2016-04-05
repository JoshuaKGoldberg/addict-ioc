'use strict';

const should = require('should');

const container = require('./../../lib/container');

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

  it('should throw error on direct circular dependency', function testCallback(next) {
    const key = 'test';
    const config = {
      test: 'this is a test'
    };
    container.register(key, TestType)
      .dependencies(key)
      .configure(config);

    try {
      container.resolve(key);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });

  it('should throw error on indirect circular dependency', function testCallback(next) {
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

    container.register(dependencyKey, TestType)
      .dependencies(key);

    container.register(key, SecondType)
      .dependencies(dependencyKey)
      .configure(config);

    try {
      container.resolve(key);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });

  it('should throw error if dependency key is not registered', function testCallback(next) {

    try {
      container.resolve('thisKeyIsNotDefined');

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });

  it('should throw error if type of dependencies declaration is not supported', function testCallback(next) {
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

    const registration = container.register(key, SecondType)
      .configure(config);

    // this is against the pattern, but validation will falsify during resolve
    registration.settings.dependencies = () => {
      'should not work'
    };

    try {
      container.resolve(key);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });

  it('should throw error if setter of inject target property is missing', function testCallback(next) {
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
    };

    container.register(dependencyKey, TestType);

    container.register(key, SecondType)
      .dependencies(dependencyKey)
      .injectInto('injectionTargetProperty')
      .configure(config);

    try {
      container.resolve(key);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });

  it('should throw error if injection target type is not supported', function testCallback(next) {
    const key = 'test';
    const dependencyKey = 'dependency';
    const config = {
      test: 'this is a test'
    };

    let secondTypeConstructorParam;

    const SecondType = class SecondType {
      constructor(param) {
        secondTypeConstructorParam = param;
        this.injectionTargetMethod = [];
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
      .injectInto('injectionTargetMethod')
      .configure(config);

    try {
      container.resolve(key);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });

  it('should throw error if injection target is undefined on the target', function testCallback(next) {
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
      .injectInto('injectionTargetMethod')
      .configure(config);

    try {
      container.resolve(key);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });

  it('should throw error if a config shall be injected and the config setter is missing', function testCallback(next) {
    const key = 'test';
    const config = {
      test: 'this is a test'
    };

    const type = class SecondType {
      constructor() {}
      get config() {
        return this._config;
      }
    };

    container.register(key, type)
      .configure(config);

    try {
      container.resolve(key);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });

  it('should throw error if config function returned undefined', function testCallback(next) {
    const key = 'test';
    const config = {
      test: 'this is a test'
    };

    const type = class SecondType {
      constructor() {}
      get config() {
        return this._config;
      }
    };

    container.register(key, type)
      .configure(() => undefined);

    try {
      container.resolve(key);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });
});
