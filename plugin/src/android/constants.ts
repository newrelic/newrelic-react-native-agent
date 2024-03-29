/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

const projectPackage = require('newrelic-react-native-agent/package.json');


export const newrelicClassPath = 'com.newrelic.agent.android:agent-gradle-plugin';
export const newrelicPlugin = 'newrelic';
export const newrelicAndroidVersion = projectPackage.sdkVersions.android.newrelic;
export const networkAcessStatePermission= 'android.permission.ACCESS_NETWORK_STATE'