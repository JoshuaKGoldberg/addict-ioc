'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

class TestType {}

describe('Type Registration Set Attribute Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should configure registered type', function testCallback() {
    const key = 'test';
    const config = {
      test: 'this is a test'
    };
    const testAttribute = { key: 'test1', value: 'value1' };
    container.register(key, TestType)
      .setAttribute(testAttribute.key, testAttribute.value);
    should(container.registrations[key].settings.tags[testAttribute.key]).equal(testAttribute.value);
  });

  it('should throw error if no registration is started', function testCallback(next) {

    const testAttribute = { key: 'test1', value: 'value1' };

    try {
      container.setAttribute(testAttribute.key, testAttribute.value);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
