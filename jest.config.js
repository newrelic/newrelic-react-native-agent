/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@?react-native|react-native-promise-rejection-utils)/)'
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],
  // Explicitly map the modules that need special mocking
  moduleNameMapper: {
    'react-native/Libraries/Core/Devtools/parseErrorStack': '<rootDir>/__mocks__/react-native/Libraries/Core/Devtools/parseErrorStack.js',
    'react-native/Libraries/Core/Devtools/symbolicateStackTrace': '<rootDir>/__mocks__/react-native/Libraries/Core/Devtools/symbolicateStackTrace.js'
  }
}; 