'use strict';

const should = require('should');

const Container = require('./../../dist/commonjs').Container;

const container = new Container();

class TestType {}

describe('Type Registration Set Tag Test', function describeCallback() {

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
      .setTag(testAttribute.key, testAttribute.value);
    should(container.registrations[key].settings.tags[testAttribute.key]).equal(testAttribute.value);
  });

  it('should throw error if no registration is started', function testCallback(next) {

    const testAttribute = { key: 'test1', value: 'value1' };

    try {
      container.setTag(testAttribute.key, testAttribute.value);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
