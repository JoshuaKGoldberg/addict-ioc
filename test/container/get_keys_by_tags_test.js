'use strict';

const should = require('should');

const Container = require('./../../dist/commonjs').Container;

const container = new Container();

class TestType {}

describe('Dependency Injection Container Get Keys By Tags Test', () => {

  beforeEach(() => {
    container.clear();
  });

  it('should get keys by single tag', () => {

    const testKey = 'test';
    const testTag = 'tag';

    container.register(testKey, TestType)
      .tags(testTag);

    const foundKeys = container.getKeysByTags(testTag);

    should(foundKeys.length)
      .equal(1);
    should(foundKeys[0])
      .equal(testKey);
  });

  it('should get keys by multiple tags', () => {

    const testKey = 'test';
    const secondTestKey = 'second';
    const testTag = 'tag';
    const testTagTwo = 'tag2';

    class SecondType {}

    container.register(testKey, TestType)
      .tags(testTag, testTagTwo);

    container.register(secondTestKey, SecondType)
      .tags(testTag);

    const foundKeys = container.getKeysByTags([testTag, testTagTwo]);
    const foundKeysForSingleTag = container.getKeysByTags(testTag);

    should(foundKeys.length)
      .equal(1);
    should(foundKeys)
      .containEql(testKey);
    should(foundKeysForSingleTag.length)
      .equal(2);
    should(foundKeysForSingleTag)
      .containEql(testKey);
    should(foundKeysForSingleTag)
      .containEql(secondTestKey);
  });

  it('should not get keys without single tag', () => {

    const testKey = 'test';
    const testTag = 'tag';
    const testTagTwo = 'tag2';

    container.register(testKey, TestType)
      .tags(testTag);

    const foundKeys = container.getKeysByTags(testTagTwo);

    should(foundKeys.length)
      .equal(0);
  });

  it('should not get keys without multiple tags', () => {

    const testKey = 'test';
    const testTag = 'tag';
    const testTagTwo = 'tag2';

    container.register(testKey, TestType)
      .tags(testTag);

    const foundKeys = container.getKeysByTags([testTag, testTagTwo]);

    should(foundKeys.length)
      .equal(0);
  });


  it('should get keys by single tag value', () => {

    const testKey = 'test';
    const testTag = 'tag';
    const testTagValue = 'testValue';

    container.register(testKey, TestType)
      .setTag(testTag, testTagValue);

    const tagValueQuery = {
      [testTag]: testTagValue,
    };

    const foundKeys = container.getKeysByTags(tagValueQuery);

    should(foundKeys.length)
      .equal(1);
    should(foundKeys)
      .containEql(testKey);
  });

  it('should get keys by multiple tag values', () => {

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
      [testTagTwo]: testTagTwoValue,
    };

    const foundKeys = container.getKeysByTags(attributeQuery);

    should(foundKeys.length)
      .equal(1);
    should(foundKeys)
      .containEql(testKey);
  });

  it('should not get keys without single tag value', () => {

    const testKey = 'test';
    const testTag = 'tag';
    const testTagValue = 'testValue';

    container.register(testKey, TestType);

    const attributeQuery = {
      [testTag]: testTagValue,
    };

    const foundKeys = container.getKeysByTags(attributeQuery);

    should(foundKeys.length)
      .equal(0);
  });

  it('should not get keys without multiple tag values', () => {

    const testKey = 'test';
    const testTag = 'tag';
    const testTagTwo = 'tag2';
    const testTagValue = 'testValue';
    const testTagTwoValue = 'testValue2';

    container.register(testKey, TestType)
      .setAttribute(testTagTwo, testTagTwoValue);

    const attributeQuery = {
      [testTag]: testTagValue,
      [testTagTwo]: testTagTwoValue,
    };

    const foundKeys = container.getKeysByTags(attributeQuery);

    should(foundKeys.length)
      .equal(0);
  });

});
