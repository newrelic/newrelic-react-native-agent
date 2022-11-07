/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

const mockedModule = jest.mock('react-native-promise-rejection-utils');

mockedModule.getUnhandledPromiseRejectionTracker = jest.fn();

mockedModule.setUnhandledPromiseRejectionTracker = jest.fn();

module.exports = mockedModule;