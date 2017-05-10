'use strict';

const Container = require('./../dist/commonjs').Container;

const container = new Container();

const TestType = class TestType {
  constructor() {}
  set config(value) {
    this._config = value;
  }
  get config() {
    return this._config;
  }
};

  const key = 'test';
  const dependencyKey = 'dependency';
  const config = {
    test: 'this is a test'
  };

  const SecondType = class SecondType {
    constructor(firstDependency, eins, zwei) {
      this._injectedDependency = firstDependency;
      this._eins = eins;
      this._zwei = zwei;
    }
    get injectedDependency() {
      return this._injectedDependency;
    }
    get eins() {
      return this._eins;
    }
    get zwei() {
      return this._zwei;
    }
    get config() {
      return this._config;
    }
    set config(value) {
      this._config = value;
    }
  };

  container.register(dependencyKey, TestType);

  container.register(key, SecondType)
    .dependencies(dependencyKey)
    .configure(config);

  const testArgs = [
    '1',
    '2'
  ];

  const resolvedKey = container.resolve(key, testArgs, undefined);
