/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

import MOCK_NRM_MODULAR_AGENT from './nrm-modular-agent';

const reactNative = {
  NativeModules: { 
    NRMModularAgent: MOCK_NRM_MODULAR_AGENT      
  },
  Platform: {
    OS: 'ios',
    constants: {
      reactNativeVersion:{
        'major':0,
        'minor':66,
        'patch':3
      }
    }
  },  requireNativeComponent: jest.fn((componentName) => {
    // Return a mock component that can be used in tests
    return componentName;
  }),
};

module.exports = reactNative;
