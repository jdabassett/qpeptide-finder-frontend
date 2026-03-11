/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'next/core-web-vitals',
  ],
  rules: {
    // Add project-specific rule overrides here if you want
  },
};