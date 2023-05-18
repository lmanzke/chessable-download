// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  moduleFileExtensions: ['ts', 'js', 'json'],

  preset: 'ts-jest/presets/js-with-babel',

  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest',
  },

  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  testMatch: ['<rootDir>/tests/**/*.spec.js', '<rootDir>/tests/**/*.spec.ts'],

  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(bootstrap-vue)/)'],
};
