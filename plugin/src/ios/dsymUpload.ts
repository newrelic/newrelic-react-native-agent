/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';

import { ConfigPlugin, withDangerousMod, withXcodeProject } from '@expo/config-plugins';

export const defaultIosAppTokenEnvName = 'NEWRELIC_IOS_APP_TOKEN';
export const defaultIosApiKeyEnvName = 'NEWRELIC_USER_API_KEY';

export type NewRelicIosPluginProps = {
  ios?: {
    /**
     * Name of the environment variable containing the iOS application token (the same
     * token passed to `NewRelic.startAgent()` on iOS). Used by both the dSYM upload and
     * the React Native source map upload build phase scripts.
     * Defaults to `NEWRELIC_IOS_APP_TOKEN`.
     */
    appTokenEnvName?: string;
    /**
     * Name of the environment variable containing the New Relic User/Ingest API key.
     * Only used by the React Native source map upload script.
     * Defaults to `NEWRELIC_USER_API_KEY` (shared with the Android default).
     */
    apiKeyEnvName?: string;
  };
};

const VENDORED_TOOLS_DIR = path.join(__dirname, '..', '..', 'dsym-upload-tools');
const TOOLS_SUBDIR_NAME = 'dsym-upload-tools';
const BUILD_PHASE_NAME = 'Upload dSYMs and Source Maps to New Relic';
const BUNDLE_PHASE_NAME = 'Bundle React Native code and images';
const SOURCEMAP_FILE_EXPORT_LINE = 'export SOURCEMAP_FILE="$DERIVED_FILE_DIR/main.jsbundle.map"';

/**
 * Copy the vendored `dsym-upload-tools` scripts into `ios/dsym-upload-tools`, since that
 * directory is regenerated on every prebuild (locally and on EAS Build).
 */
export const withNewRelicDsymUploadFiles: ConfigPlugin = config => {
  return withDangerousMod(config, [
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

function unwrapShellScript(raw: string): string {
  const trimmed = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  return trimmed.replace(/\\"/g, '"').replace(/\\n/g, '\n');
}

function wrapShellScript(text: string): string {
  return '"' + text.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
}

function buildUploadScript(appTokenEnvName: string, apiKeyEnvName: string): string {
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
export const withNewRelicDsymUploadBuildPhase: ConfigPlugin<NewRelicIosPluginProps> = (
  config,
  props = {},
) => {
  const appTokenEnvName = props.ios?.appTokenEnvName ?? defaultIosAppTokenEnvName;
  const apiKeyEnvName = props.ios?.apiKeyEnvName ?? defaultIosApiKeyEnvName;

  return withXcodeProject(config, config => {
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
      const { buildPhase } = project.addBuildPhase(
        [],
        'PBXShellScriptBuildPhase',
        BUILD_PHASE_NAME,
        project.getFirstTarget().uuid,
        { shellPath: '/bin/sh', shellScript: buildUploadScript(appTokenEnvName, apiKeyEnvName) },
      );
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
