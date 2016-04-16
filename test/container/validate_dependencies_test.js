'use strict';

const should = require('should');

const container = require('./../../lib/container');

class TestType {}

describe.only('Dependency Injection Container Validate Dependencies Test', function describeCallback() {

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

});
