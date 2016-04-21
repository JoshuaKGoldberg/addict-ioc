'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

class TestType {}

describe('Type Registration Dependencies Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should configure registered type', function testCallback() {
    const key = 'test';
    const dependenciesTestValue = 'anyKey';
    container.register(key, TestType)
      .dependencies(dependenciesTestValue);

    should(container.registrations[key].settings.dependencies).containEql(dependenciesTestValue);
  });

  it('should throw error if no registration is started', function testCallback(next) {

    try {
      container.dependencies('someKey');

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });

  it('should throw error if type of dependencies declaration is not supported', function testCallback(next) {

    try {
      container.register('test', TestType)
        .dependencies({});

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });
});
