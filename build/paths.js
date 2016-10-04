var path = require('path');
var fs = require('fs');

// hide warning //
var emitter = require('events');
emitter.defaultMaxListeners = 20;

var appRoot = 'src/';
var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

var paths = {
  root: appRoot,
  source: appRoot + '**/*.ts',
  output: 'dist/',
  doc:'./doc',
  packageName: 'addict-ioc',
  ignore: [],
  useTypeScriptForDTS: false,
  importsToAdd: [],
  sort: true
};

paths.files = [
  paths.source
];

module.exports = paths;
