module.exports = {
  // A set of global variables that need to be available in all test environments
  globals: {
    "ts-jest": {
      "tsConfig": "packages/gulp-i18n-wxml/tsconfig.json"
    }
  },

  // An array of file extensions your modules use
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],

  // The root directory that Jest should scan for tests and modules within
  rootDir: '../',

  // The test environment that will be used for testing
  testEnvironment: "node",

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "<rootDir>/packages/gulp-i18n-wxml/__tests__/**/*.ts"
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
};
