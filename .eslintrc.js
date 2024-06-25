module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:chai-friendly/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'prefer-destructuring': 'off',
    'chai-friendly/no-unused-expressions': 'off',
    'object-shorthand': ['error', 'properties'],
    'no-console': 'off',
  },
  'editor.codeActionsOnSave': {
    'source.fixAll.eslint': true,
    'source.fixAll': true,
  },
  'eslint.codeActionsOnSave.rules': [
    '!prefer-const'
  ],
  'eslint.codeActionsOnSave.mode': 'all',
};
