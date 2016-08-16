'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

class TestType {}

describe('Type Registration Unregister Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should unregister type for key', function testCallback() {
    const key = 'test';
    container.register(key, TestType);
    container.unregister(key);
    should(container.registrations[key]).be.undefined();
  });

  it('should throw error if key is not registered', function testCallback(next) {

    try {
      container.unregister(TestType);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
