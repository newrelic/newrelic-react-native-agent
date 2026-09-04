/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';

import { ConfigPlugin, withDangerousMod } from '@expo/config-plugins';

export const defaultApiKeyEnvName = 'NEWRELIC_USER_API_KEY';
export const defaultAppTokenEnvName = 'NEWRELIC_ANDROID_APP_TOKEN';

export type NewRelicPluginProps = {
  android?: {
    /**
     * Name of the environment variable containing the New Relic User API key.
     * Written to `newrelic.properties` as `com.newrelic.api_key`.
     * Defaults to `NEWRELIC_USER_API_KEY`.
     */
    apiKeyEnvName?: string;
    /**
     * Name of the environment variable containing the Android application token
     * (the same token passed to `NewRelic.startAgent()`). Written to
     * `newrelic.properties` as `com.newrelic.application_token`.
     * Defaults to `NEWRELIC_ANDROID_APP_TOKEN`.
     */
    appTokenEnvName?: string;
  };
};

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
export const withNewRelicMapUploadProperties: ConfigPlugin<NewRelicPluginProps> = (
  config,
  props = {},
) => {
  return withDangerousMod(config, [
    'android',
    config => {
      const apiKeyEnvName = props.android?.apiKeyEnvName ?? defaultApiKeyEnvName;
      const appTokenEnvName = props.android?.appTokenEnvName ?? defaultAppTokenEnvName;
      const apiKey = process.env[apiKeyEnvName];
      const appToken = process.env[appTokenEnvName];

      const lines: string[] = [];
      if (apiKey) {
        lines.push(`com.newrelic.api_key=${apiKey}`);
      }
      if (appToken) {
        lines.push(`com.newrelic.application_token=${appToken}`);
      }

      if (lines.length === 0) {
        return config;
      }

      const propertiesPath = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'newrelic.properties',
      );
      fs.writeFileSync(propertiesPath, lines.join('\n') + '\n');

      return config;
    },
  ]);
};
