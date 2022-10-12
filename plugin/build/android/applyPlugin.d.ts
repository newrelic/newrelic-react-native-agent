/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

import { ConfigPlugin } from '@expo/config-plugins';
/**
 * Update `app/build.gradle` by applying newrelic plugin
 */
export declare const withApplyNewRelicPlugin: ConfigPlugin;
export declare function applyPlugin(appBuildGradle: string): string;
