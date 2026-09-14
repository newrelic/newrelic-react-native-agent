"use strict";
/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withNewRelicMapUploadProperties = exports.defaultAppTokenEnvName = exports.defaultApiKeyEnvName = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_plugins_1 = require("@expo/config-plugins");
exports.defaultApiKeyEnvName = 'NEWRELIC_USER_API_KEY';
exports.defaultAppTokenEnvName = 'NEWRELIC_ANDROID_APP_TOKEN';
/**
 * Write `android/app/newrelic.properties` with the New Relic User API key and Android
 * application token sourced from environment variables, so the agent's
 * `newrelicMapUploadRelease` and `newrelicReactNativeSourceMapUploadRelease` Gradle
 * tasks can automatically upload the ProGuard/R8 mapping file and React Native source
 * map after release builds, without committing credentials to the repo.
 *
 * Property names (`com.newrelic.api_key` / `com.newrelic.application_token`) match what
 * the native `agent-gradle-plugin` reads from this file.
 */
const withNewRelicMapUploadProperties = (config, props = {}) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        'android',
        config => {
            var _a, _b, _c, _d;
            const apiKeyEnvName = (_b = (_a = props.android) === null || _a === void 0 ? void 0 : _a.apiKeyEnvName) !== null && _b !== void 0 ? _b : exports.defaultApiKeyEnvName;
            const appTokenEnvName = (_d = (_c = props.android) === null || _c === void 0 ? void 0 : _c.appTokenEnvName) !== null && _d !== void 0 ? _d : exports.defaultAppTokenEnvName;
            const apiKey = process.env[apiKeyEnvName];
            const appToken = process.env[appTokenEnvName];
            const lines = [];
            if (apiKey) {
                lines.push(`com.newrelic.api_key=${apiKey}`);
            }
            if (appToken) {
                lines.push(`com.newrelic.application_token=${appToken}`);
            }
            if (lines.length === 0) {
                return config;
            }
            const propertiesPath = path.join(config.modRequest.platformProjectRoot, 'app', 'newrelic.properties');
            fs.writeFileSync(propertiesPath, lines.join('\n') + '\n');
            return config;
        },
    ]);
};
exports.withNewRelicMapUploadProperties = withNewRelicMapUploadProperties;
