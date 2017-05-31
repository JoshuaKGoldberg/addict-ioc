'use strict';

const should = require('should');

const Container = require('./../../dist/commonjs').Container;

const container = new Container();

class TestType {}

describe('Dependency Injection Container Validate Dependencies Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should throw error if dependencies are not registered', function testCallback(next) {
    const key = 'test';

    container.register(key, TestType)
      .dependencies('someMissingKey');

    try {
      container.validateDependencies();

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });

  it('should throw error if dependencies for given key are not registered', function testCallback(next) {
    const key = 'test';

    container.register(key, TestType)
      .dependencies('someMissingKey');

    try {
      container.validateDependencies(key);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });

  it('should now throw error if original dependency is missing but overwritten dependency exists', function testCallback(next) {

    try {
      const key = 'test';
      const secondKey = 'secondKey';

      const SecondType = class SecondType {};

      container.register(secondKey, SecondType);

      container.register(key, TestType)
        .overwrite(key, secondKey);

      next();

    } catch (error) {
      next(error);
    }
  });

  it('should throw error if overwritten key is not registered', function testCallback(next) {

    try {
      const key = 'test';
      const secondKey = 'secondKey';
      const thirdKey = 'thirdKey';

      container.register(secondKey, TestType);

      container.register(key, TestType)
        .dependencies(secondKey)
        .overwrite(secondKey, thirdKey);

      container.validateDependencies();

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });

  it('should throw error if dependency of dependency for given key is not registered', function testCallback(next) {
    const key = 'test';

    container.register(key, TestType)
      .dependencies('somethingElse');

    container.register('somethingElse', TestType)
      .dependencies('someMissingKey');

    try {
      container.validateDependencies(key);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });

  it('should not throw error if dependencies for other than given key are not registered', function testCallback(next) {
    const key = 'test';
    const registeredDependency = 'dep';

    container.register(key, TestType)
      .dependencies(registeredDependency);

    container.register(registeredDependency, TestType);

    container.register('somethingElse', TestType)
      .dependencies('someMissingKey');

    try {
      container.validateDependencies(key);
      next();

    } catch (error) {
      // console.log(error);
      next(error);
    }
  });

  it('should not throw error if no dependencies are registered', function testCallback(next) {
    const key = 'test';

    container.register(key, TestType);

    try {
      container.validateDependencies(key);
      next();

    } catch (error) {
      next(error);
    }
  });

  it('should throw error on direct circular dependency', function testCallback(next) {
    const key = 'test';

    const SecondType = class SecondType {};

    container.register(key, SecondType)
      .dependencies(key);

    try {
      container.validateDependencies(key);

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
      container.validateDependencies(key);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });

  it('should not throw error on circular dependency that includes a singleton', function testCallback() {
    const key = 'test';
    const secondKey = 'second';

    const SecondType = class SecondType {};

    container.register(secondKey, SecondType)
      .dependencies(key)
      .singleton();

    const ThirdType = class ThirdType {};

    container.register(key, ThirdType)
      .dependencies(secondKey);

    container.validateDependencies(key);
  });

  it('should throw error on circular dependency that does not include a circular break', function testCallback(next) {
    const key = 'test';
    const secondKey = 'second';

    const SecondType = class SecondType { };

    container.register(secondKey, SecondType)
      .dependencies(key);

    const ThirdType = class ThirdType { };

    container.register(key, ThirdType)
      .dependencies(secondKey);

    try {
      container.validateDependencies(key);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });


  it('should not throw error on circular dependency that includes lazy dependencies', function testCallback() {
    const key = 'test';
    const secondKey = 'second';

    const SecondType = class SecondType { };

    container.register(secondKey, SecondType)
      .dependencies(key)
      .injectLazy();

    const ThirdType = class ThirdType { };

    container.register(key, ThirdType)
      .dependencies(secondKey);

    container.validateDependencies(key);
  });

  it('should throw error on circular dependency that includes explicitly declared lazy dependencies', function testCallback(next) {
    const key = 'test';
    const secondKey = 'second';
    const thirdKey = 'third';

    const FirstType = class FirstType {};

    container.register(thirdKey, FirstType);

    const SecondType = class SecondType {};

    container.register(secondKey, SecondType)
      .dependencies(key, thirdKey)
      .injectLazy(thirdKey);

    const ThirdType = class ThirdType {};

    container.register(key, ThirdType)
      .dependencies(secondKey);

    try {
      container.validateDependencies(key);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });
});
