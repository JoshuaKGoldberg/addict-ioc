'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

class TestType {}

describe('Type Registration with Injection Target Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should configure registered type', function testCallback() {
    const key = 'test';
    const target = 'testTarget';
    container.register(key, TestType)
             .injectInto(target);
    should(container.registrations[key].settings.injectInto).equal(target);
  });

  it('should throw error if no registration is started', function testCallback(next) {

    try {
      container.injectInto('testTarget');

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
               .injectInto(target);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
