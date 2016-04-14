'use strict';

const fs = require('fs');
const path = require('path');

const simple = require('./registration/simple');

const benchmarks = [
  simple
];

function run(iterations) {
  const exportFilePath = 'benchmark_results.txt';
  const logStream = fs.createWriteStream(path.resolve(process.cwd(), exportFilePath));
  process.stdout.write = logStream.write.bind(logStream);

  benchmarks.forEach((Benchmark) => {
    let b = new Benchmark();
    b.start(iterations);
    b = null;
    global.gc();
  });
}

run(1e6);
