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

describe('Dependency Injection Container Resolve Error Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should throw error on direct circular dependency', function testCallback(next) {
    const key = 'test';

    const SecondType = class SecondType {};

    container.register(key, SecondType)
      .dependencies(key);

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

    const SecondType = class SecondType {};

    container.register(dependencyKey, TestType)
      .dependencies(key);

    container.register(key, SecondType)
      .dependencies(dependencyKey);

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
      return 'should not work';
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
