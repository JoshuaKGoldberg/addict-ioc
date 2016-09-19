'use strict';

const should = require('should');

const container = require('./../../lib/container');

class TestType {}

describe('Dependency Injection Container Get Keys By Tags Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should get keys by single tag', function testCallback() {

    const testKey = 'test';
    const testTag = 'tag';

    container.register(testKey, TestType)
      .tags(testTag);

    const foundKeys = container.getKeysByTags(testTag);

    should(foundKeys.length).equal(1);
    should(foundKeys[0]).equal(testKey);
  });

  it('should get keys by multiple tags', function testCallback() {

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

    should(foundKeys.length).equal(1);
    should(foundKeys).containEql(testKey);
    should(foundKeysForSingleTag.length).equal(2);
    should(foundKeysForSingleTag).containEql(testKey);
    should(foundKeysForSingleTag).containEql(secondTestKey);
  });

  it('should not get keys without single tag', function testCallback() {

    const testKey = 'test';
    const testTag = 'tag';
    const testTagTwo = 'tag2';

    container.register(testKey, TestType)
      .tags(testTag);

    const foundKeys = container.getKeysByTags(testTagTwo);

    should(foundKeys.length).equal(0);
  });

  it('should not get keys without multiple tags', function testCallback() {

    const testKey = 'test';
    const testTag = 'tag';
    const testTagTwo = 'tag2';

    container.register(testKey, TestType)
      .tags(testTag);

    const foundKeys = container.getKeysByTags([testTag, testTagTwo]);

    should(foundKeys.length).equal(0);
  });
});
