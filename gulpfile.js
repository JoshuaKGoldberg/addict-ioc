'use strict';

const BuildSystem = require('@5minds/gulptraum');

const buildSystemConfig = {
  packageName: 'addict-ioc'
};

const buildSystem = new BuildSystem(buildSystemConfig);

buildSystem.config = buildSystemConfig;

const typeScriptConfig = {
};

const gulp = require('gulp');

buildSystem
  .use('typescript', typeScriptConfig)
  .registerTasks(gulp);
