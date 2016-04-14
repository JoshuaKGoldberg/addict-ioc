'use strict';

class BenchmarkBase {

  constructor(name) {
    this._name = name;
    this._log = '';
  }

  get name() {
    return this._name;
  }

  get result() {
    return this._log;
  }

  start(iterations) {
    console.log('------------------------------------------');
    this.log(this._name);
    this.log(`${iterations} iterations`);
    this._start = new Date().getTime();

    for (let i = 0; i < iterations; i++) {
      this.benchmark(i);
    }

    this.end();
    console.log('------------------------------------------');
  }

  benchmark() {
    this.log('benchmark not implemented');
  }

  end() {
    const end = new Date().getTime();
    this.log(`took ${end - this._start} ms`);
    this.log(`memory usage`);
    console.log(`${JSON.stringify(process.memoryUsage(), null, 2)}`);
    this.log(`versions`);
    console.log(`${JSON.stringify(process.versions, null, 2)}`);
  }

  log(content) {
    console.log(`::: ${content}`);
  }
}

module.exports = BenchmarkBase;
