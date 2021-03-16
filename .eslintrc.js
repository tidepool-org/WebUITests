module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'chai-friendly/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'prefer-destructuring': 'off',
  },
};
