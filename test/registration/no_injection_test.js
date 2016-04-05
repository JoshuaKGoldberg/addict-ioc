'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

class TestType {}

describe('Type Registration Without Injection Test', function describeCallback() {

  it('should configure registered type', function testCallback() {
    const key = 'test';
    container.register(key, TestType)
      .noInjection();

    should(container.registrations[key].settings.wantsInjection).equal(false);
  });

  it('should throw error if no registration is started', function testCallback(next) {

    try {
      container.noInjection();

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });

  it('should throw error if injection target is declared', function testCallback(next) {

    try {
      const key = 'test';
      const target = 'testTarget';
      container.register(key, TestType)
        .injectInto(target)
        .noInjection();

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });

  it('should throw error if lazy injection is declared', function testCallback(next) {

    try {
      const key = 'test';
      const target = 'testTarget';
      container.register(key, TestType)
        .injectLazy()
        .noInjection();

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
