/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

const mockSymbolicateStackTrace = jest.fn().mockImplementation(async (stack) => {
  return { stack };
});

// Module exports with default for ESM compatibility
mockSymbolicateStackTrace.default = mockSymbolicateStackTrace;

module.exports = mockSymbolicateStackTrace; 