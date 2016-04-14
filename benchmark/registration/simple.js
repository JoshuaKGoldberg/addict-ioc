'use strict';

const BenchmarkBase = require('./../benchmark_base');
const container = require('./../../lib/container');

class TestType {}

class DependencyType {}

class SimpleBenchmark extends BenchmarkBase {
  constructor() {
    super('simple');
  }

  benchmark() {
    container.register(TestType)
      .dependencies(DependencyType);
  }
}

module.exports = SimpleBenchmark;
