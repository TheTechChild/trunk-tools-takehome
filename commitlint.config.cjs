// This file uses CommonJS syntax because commitlint doesn't fully support ESM configs
// when used in CI environments or with certain tools
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [2, 'always', 100],
  },
}; 