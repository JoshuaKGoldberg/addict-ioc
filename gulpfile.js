'use strict';

const gulptraum = require('gulptraum');

const buildSystemConfig = {
  packageName: 'addict-ioc',
  // paths: {
  //   source: 'src/',
  // },
};

const buildSystem = new gulptraum.BuildSystem(buildSystemConfig);

buildSystem.config = buildSystemConfig;

const typeScriptConfig = {
};

const gulp = require('gulp');

buildSystem
  .registerPlugin('typescript', gulptraum.plugins.typescript, typeScriptConfig)
  .registerTasks(gulp);
