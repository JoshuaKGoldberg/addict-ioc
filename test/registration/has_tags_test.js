'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

class TestType {}

describe('Type Registration With Tags Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should return true if all tags are found', function testCallback() {
    const key = 'test';
    const tag1 = 'exampleTag1';
    const tag2 = 'exampleTag2';
    const registration = container.register(key, TestType)
      .tags(tag1, tag2);

    const result = registration.hasTags([tag1, tag2]);

    should(result).be.true();
  });

  it('should return false if a tag is missing', function testCallback() {
    const key = 'test';
    const tag1 = 'exampleTag1';
    const tag2 = 'exampleTag2';
    const registration = container.register(key, TestType)
      .tags(tag1);

    const result = registration.hasTags([tag1, tag2]);

    should(result).be.false();
  });
});
