/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { ConfigPlugin } from '@expo/config-plugins';
export declare const defaultIosAppTokenEnvName = "NEWRELIC_IOS_APP_TOKEN";
export declare const defaultIosApiKeyEnvName = "NEWRELIC_USER_API_KEY";
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
/**
 * Copy the vendored `dsym-upload-tools` scripts into `ios/dsym-upload-tools`, since that
 * directory is regenerated on every prebuild (locally and on EAS Build).
 */
export declare const withNewRelicDsymUploadFiles: ConfigPlugin;
/**
 * Add a Run Script build phase (after "Bundle React Native code and images") that invokes
 * the vendored dSYM and React Native source map upload scripts, and ensure the bundle
 * phase exports SOURCEMAP_FILE so a source map actually gets generated for the script to
 * find. Both additions are idempotent across repeated prebuilds.
 */
export declare const withNewRelicDsymUploadBuildPhase: ConfigPlugin<NewRelicIosPluginProps>;
