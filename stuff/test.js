'use strict';

const Container = require('./../dist/commonjs').Container;

const container = new Container();

class TestType {
  set config(value) {
    this._config = value;
  }
  get config() {
    return this._config;
  }
}

const SecondType = class SecondType {
  constructor(testType) {
    this._testType = testType;
  }

  get testType() {
    return this._testType;
  }

  get config() {
    return this._config;
  }

  set config(value) {
    this._config = value;
  }
};

const testConfig = {
  testConfiguration: 'test'
};

const key = 'test';
const firstKey = 'firstTest';
const secondKey = 'secondKey';

container.register(key, TestType)
  .singleton()
  .configure(testConfig);

container.register(firstKey, SecondType)
  .dependencies(key);

container.register(secondKey, SecondType)
  .dependencies(key);


const first = container.resolve(firstKey);
// testConfig.testConfiguration = 'changed';
const second = container.resolve(secondKey);