'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

class TestType {}

describe('Type Registration With Lazy Injection Test', function describeCallback() {

  it('should configure registered type', function testCallback() {
    const key = 'test';
    container.register(key, TestType)
      .injectLazy();

    should(container.registrations[key].settings.isLazy).equal(true);
  });

  it('should throw error if no registration is started', function testCallback(next) {

    try {
      container.injectLazy();

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });

  it('should throw error if noInjection is forced', function testCallback(next) {

    try {
      const key = 'test';
      const target = 'testTarget';
      container.register(key, TestType)
        .noInjection()
        .isLazy();

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
