'use strict';

module.exports = {
  env: {
    commonjs: true,
    node: true
  },
  extends: 'airbnb-base/legacy',
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'linebreak-style': ['error', 'windows']
  }
};
