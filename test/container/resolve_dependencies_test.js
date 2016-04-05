'use strict';

const should = require('should');

const container = require('./../../lib/container');

class TestType {}

describe('Dependency Injection Container Resolve Dependencies Test', function describeCallback() {

  it('should resolve registration without dependencies', function testCallback() {
    const key = 'test';

    container.register(key, TestType);

    const resolution = container.resolveDependencies(key);

    should(resolution).not.be.null();
    should(resolution).be.instanceOf(Array);
  });

  it('should resolve registration with single dependency', function testCallback() {
    const key = 'test';
    const dependencyKey = 'dependency';

    const SecondType = class SecondType {
      constructor() {}
    };

    container.register(dependencyKey, TestType);

    container.register(key, SecondType)
      .dependencies(dependencyKey);

    const resolution = container.resolveDependencies(key);

    should(resolution).be.instanceOf(Array);
    should(resolution[0]).not.be.null();
    should(resolution[0]).be.instanceOf(TestType);
  });

  it('should resolve registration with multiple dependencies', function testCallback() {
    const key = 'test';
    const firstDependencyKey = 'dependency1';
    const secondDependencyKey = 'dependency2';

    const SecondType = class SecondType {
      constructor() {}
    };
    const ThirdType = class ThirdType {
      constructor() {}
    };

    container.register(firstDependencyKey, TestType);
    container.register(secondDependencyKey, ThirdType);

    container.register(key, SecondType)
      .dependencies([firstDependencyKey, secondDependencyKey]);

    const resolution = container.resolveDependencies(key);

    should(resolution).be.instanceOf(Array);
    should(resolution[0]).not.be.null();
    should(resolution[0]).be.instanceOf(TestType);
    should(resolution[1]).not.be.null();
    should(resolution[1]).be.instanceOf(ThirdType);
  });
});
