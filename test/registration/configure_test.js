'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

class TestType {}

describe('Type Registration Configure Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should configure registered type', function testCallback() {
    const key = 'test';
    const config = {
      test: 'this is a test'
    };
    container.register(key, TestType)
      .configure(config);
    should(container.registrations[key].settings.config).equal(config);
  });

  it('should throw error if no registration is started', function testCallback(next) {

    const config = { something: 'test' };

    try {
      container.configure(config);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });

  it('should throw error if type of config declaration is not supported', function testCallback(next) {

    try {
      container.configure('this should not work');

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
