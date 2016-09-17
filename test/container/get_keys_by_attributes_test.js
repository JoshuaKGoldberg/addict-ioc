'use strict';

const should = require('should');

const container = require('./../../lib/container');

class TestType {}

describe('Dependency Injection Container Get Keys By Attributes Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should get keys by single attribute', function testCallback() {

    const testKey = 'test';
    const testTag = 'tag';
    const testTagValue = 'testValue';

    container.register(testKey, TestType)
      .setAttribute(testTag, testTagValue);

    const attributeQuery = {
      [testTag]: testTagValue
    };

    const foundKeys = container.getKeysByAttributes(attributeQuery);

    should(foundKeys.length).equal(1);
    should(foundKeys).containEql(testKey);
  });

  it('should get keys by multiple attributes', function testCallback() {

    const testKey = 'test';
    const testTag = 'tag';
    const testTagTwo = 'tag2';
    const testTagValue = 'testValue';
    const testTagTwoValue = 'testValue2';

    container.register(testKey, TestType)
      .setAttribute(testTag, testTagValue)
      .setAttribute(testTagTwo, testTagTwoValue);

    const attributeQuery = {
      [testTag]: testTagValue,
      [testTagTwo]: testTagTwoValue
    };

    const foundKeys = container.getKeysByAttributes(attributeQuery);

    should(foundKeys.length).equal(1);
    should(foundKeys).containEql(testKey);
  });

  it('should not get keys without single attribute', function testCallback() {

    const testKey = 'test';
    const testTag = 'tag';
    const testTagValue = 'testValue';

    container.register(testKey, TestType);

    const attributeQuery = {
      [testTag]: testTagValue
    };

    const foundKeys = container.getKeysByAttributes(attributeQuery);

    should(foundKeys.length).equal(0);
  });

  it('should not get keys without multiple attributes', function testCallback() {

    const testKey = 'test';
    const testTag = 'tag';
    const testTagTwo = 'tag2';
    const testTagValue = 'testValue';
    const testTagTwoValue = 'testValue2';

    container.register(testKey, TestType)
      .setAttribute(testTagTwo, testTagTwoValue);

    const attributeQuery = {
      [testTag]: testTagValue,
      [testTagTwo]: testTagTwoValue
    };

    const foundKeys = container.getKeysByAttributes(attributeQuery);

    should(foundKeys.length).equal(0);
  });
});
