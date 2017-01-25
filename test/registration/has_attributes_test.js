'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

class TestType {}

describe('Type Registration With Tags Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should return true if all attributes are found', function testCallback() {
    const key = 'test';
    const tag1 = 'exampleTag1';
    const tag2 = 'exampleTag2';
    const testAttribute = { key: 'test1', value: 'value1' };
    const registration = container.register(key, TestType)
      .setAttribute(testAttribute.key, testAttribute.value);

    const attributeQuery = {};
    attributeQuery[testAttribute.key] = testAttribute.value;

    const result = registration.hasAttributes(attributeQuery);

    should(result).be.true();
  });

  it('should return false if an attribute is missing', function testCallback() {
    const key = 'test';
    const tag1 = 'exampleTag1';
    const tag2 = 'exampleTag2';
    const testAttribute = { key: 'test1', value: 'value1' };
    const registration = container.register(key, TestType);

    const attributeQuery = {};
    attributeQuery[testAttribute.key] = testAttribute.value;

    const result = registration.hasAttributes(attributeQuery);

    should(result).be.false();
  });

  it('should return false if an attribute has another value', function testCallback() {
    const key = 'test';
    const tag1 = 'exampleTag1';
    const tag2 = 'exampleTag2';
    const testAttribute = { key: 'test1', value: 'value1' };
    const registration = container.register(key, TestType)
      .setAttribute(testAttribute.key, 'something');

    const attributeQuery = {};
    attributeQuery[testAttribute.key] = testAttribute.value;

    const result = registration.hasAttributes(attributeQuery);

    should(result).be.false();
  });
});
