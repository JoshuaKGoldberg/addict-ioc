'use strict';

class RequireType {
  set config(value) {
    this._config = value;
  }
  get config() {
    return this._config;
  }
}

module.exports = RequireType;
