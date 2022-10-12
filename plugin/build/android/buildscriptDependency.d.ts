/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

import { ConfigPlugin } from '@expo/config-plugins';
/**
 * Update `<project>/build.gradle` by adding NewRelic dependency to buildscript
 */
export declare const withBuildscriptDependency: ConfigPlugin;
export declare function setBuildscriptDependency(buildGradle: string): string;
