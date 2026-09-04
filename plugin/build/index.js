"use strict";
/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const android_1 = require("./android");
const ios_1 = require("./ios");
const projectPackage = require('newrelic-react-native-agent/package.json');
/**
 * A config plugin for configuring `newrelic-react-native-agent`
 */
const withNewRelicRNAgent = (config, props) => {
    return (0, config_plugins_1.withPlugins)(config, [
        android_1.withBuildscriptDependency,
        android_1.withApplyNewRelicPlugin,
        android_1.withNetworkAcessPermission,
        [android_1.withNewRelicMapUploadProperties, props !== null && props !== void 0 ? props : {}],
        ios_1.withNewRelicDsymUploadFiles,
        [ios_1.withNewRelicDsymUploadBuildPhase, props !== null && props !== void 0 ? props : {}],
    ]);
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(withNewRelicRNAgent, projectPackage.name, projectPackage.version);
