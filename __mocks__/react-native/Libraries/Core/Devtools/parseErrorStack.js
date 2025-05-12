/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

const mockParseErrorStack = jest.fn().mockImplementation((error) => {
  return [{ file: 'mocked_file.js', lineNumber: 1, column: 1, methodName: 'mockFunction' }];
});

// Module exports with default for ESM compatibility
mockParseErrorStack.default = mockParseErrorStack;

module.exports = mockParseErrorStack; 