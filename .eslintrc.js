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
    'import/no-extraneous-dependencies': ['error', { devDependencies: false, optionalDependencies: false, peerDependencies: false }],
    'max-len': 'warn',
    'no-plusplus': 'warn',
  },
  globals: {
    browser: true,
  },

};
