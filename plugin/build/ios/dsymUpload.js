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
exports.withNewRelicDsymUploadBuildPhase = exports.withNewRelicDsymUploadFiles = exports.defaultIosApiKeyEnvName = exports.defaultIosAppTokenEnvName = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_plugins_1 = require("@expo/config-plugins");
exports.defaultIosAppTokenEnvName = 'NEWRELIC_IOS_APP_TOKEN';
exports.defaultIosApiKeyEnvName = 'NEWRELIC_USER_API_KEY';
const VENDORED_TOOLS_DIR = path.join(__dirname, '..', '..', 'dsym-upload-tools');
const TOOLS_SUBDIR_NAME = 'dsym-upload-tools';
const BUILD_PHASE_NAME = 'Upload dSYMs and Source Maps to New Relic';
const BUNDLE_PHASE_NAME = 'Bundle React Native code and images';
const SOURCEMAP_FILE_EXPORT_LINE = 'export SOURCEMAP_FILE="$DERIVED_FILE_DIR/main.jsbundle.map"';
/**
 * Copy the vendored `dsym-upload-tools` scripts into `ios/dsym-upload-tools`, since that
 * directory is regenerated on every prebuild (locally and on EAS Build).
 */
const withNewRelicDsymUploadFiles = config => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        'ios',
        config => {
            const destDir = path.join(config.modRequest.platformProjectRoot, TOOLS_SUBDIR_NAME);
            fs.mkdirSync(destDir, { recursive: true });
            for (const file of fs.readdirSync(VENDORED_TOOLS_DIR)) {
                const srcPath = path.join(VENDORED_TOOLS_DIR, file);
                const destPath = path.join(destDir, file);
                fs.copyFileSync(srcPath, destPath);
                fs.chmodSync(destPath, fs.statSync(srcPath).mode);
            }
            return config;
        },
    ]);
};
exports.withNewRelicDsymUploadFiles = withNewRelicDsymUploadFiles;
function unwrapShellScript(raw) {
    const trimmed = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
    return trimmed.replace(/\\"/g, '"').replace(/\\n/g, '\n');
}
function wrapShellScript(text) {
    return '"' + text.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
}
function buildUploadScript(appTokenEnvName, apiKeyEnvName) {
    return [
        'ARTIFACT_DIR="${BUILD_DIR%Build/*}"',
        '',
        `if [ -n "$${appTokenEnvName}" ]; then`,
        '  DSYM_SCRIPT=$(/usr/bin/find "${SRCROOT}" "${ARTIFACT_DIR}" -type f -name run-symbol-tool | head -n 1)',
        '  if [ -n "$DSYM_SCRIPT" ]; then',
        `    /bin/sh "$DSYM_SCRIPT" "$${appTokenEnvName}"`,
        '  fi',
        'else',
        `  echo "New Relic: ${appTokenEnvName} not set, skipping dSYM upload"`,
        'fi',
        '',
        `if [ -n "$${apiKeyEnvName}" ] && [ -n "$${appTokenEnvName}" ]; then`,
        '  SOURCEMAP_SCRIPT=$(/usr/bin/find "${SRCROOT}" "${ARTIFACT_DIR}" -type f -name upload-react-native-sourcemap | head -n 1)',
        '  if [ -n "$SOURCEMAP_SCRIPT" ]; then',
        `    /bin/sh "$SOURCEMAP_SCRIPT" "$${apiKeyEnvName}" "$${appTokenEnvName}"`,
        '  fi',
        'else',
        `  echo "New Relic: ${apiKeyEnvName} or ${appTokenEnvName} not set, skipping source map upload"`,
        'fi',
        '',
        'exit 0',
    ].join('\n');
}
/**
 * Add a Run Script build phase (after "Bundle React Native code and images") that invokes
 * the vendored dSYM and React Native source map upload scripts, and ensure the bundle
 * phase exports SOURCEMAP_FILE so a source map actually gets generated for the script to
 * find. Both additions are idempotent across repeated prebuilds.
 */
const withNewRelicDsymUploadBuildPhase = (config, props = {}) => {
    var _a, _b, _c, _d;
    const appTokenEnvName = (_b = (_a = props.ios) === null || _a === void 0 ? void 0 : _a.appTokenEnvName) !== null && _b !== void 0 ? _b : exports.defaultIosAppTokenEnvName;
    const apiKeyEnvName = (_d = (_c = props.ios) === null || _c === void 0 ? void 0 : _c.apiKeyEnvName) !== null && _d !== void 0 ? _d : exports.defaultIosApiKeyEnvName;
    return (0, config_plugins_1.withXcodeProject)(config, config => {
        const project = config.modResults;
        const bundlePhase = project.buildPhaseObject('PBXShellScriptBuildPhase', BUNDLE_PHASE_NAME);
        if (bundlePhase) {
            const script = unwrapShellScript(bundlePhase.shellScript);
            if (!script.includes('SOURCEMAP_FILE=')) {
                bundlePhase.shellScript = wrapShellScript(`${SOURCEMAP_FILE_EXPORT_LINE}\n${script}`);
            }
        }
        const existingPhase = project.buildPhaseObject('PBXShellScriptBuildPhase', BUILD_PHASE_NAME);
        if (!existingPhase) {
            const { buildPhase } = project.addBuildPhase([], 'PBXShellScriptBuildPhase', BUILD_PHASE_NAME, project.getFirstTarget().uuid, { shellPath: '/bin/sh', shellScript: buildUploadScript(appTokenEnvName, apiKeyEnvName) });
            // Without declared inputs/outputs, Xcode's new build system warns that the script
            // "has ambiguous dependencies causing it to run on every build". We DO want it to
            // run on every Release build, so explicitly mark it always-out-of-date (equivalent
            // to unchecking "Based on dependency analysis" in Xcode) rather than declaring
            // outputPaths, which could make a later build with unchanged inputs skip it.
            buildPhase.alwaysOutOfDate = 1;
        }
        return config;
    });
};
exports.withNewRelicDsymUploadBuildPhase = withNewRelicDsymUploadBuildPhase;
