import { ConfigPlugin, WarningAggregator, withProjectBuildGradle } from '@expo/config-plugins';

import { newrelicClassPath, newrelicAndroidVersion } from './constants';

/**
 * Update `<project>/build.gradle` by adding NewRelic dependency to buildscript
 */
export const withBuildscriptDependency: ConfigPlugin = config => {
  return withProjectBuildGradle(config, config => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = setBuildscriptDependency(config.modResults.contents);
    } else {
      WarningAggregator.addWarningAndroid(
        'newrelic-react-native-agent',
        `Cannot automatically configure project build.gradle if it's not groovy`,
      );
    }
    return config;
  });
};

export function setBuildscriptDependency(buildGradle: string) {
  if (!buildGradle.includes(newrelicClassPath)) {
    return buildGradle.replace(
      /dependencies\s?{/,
      `dependencies {
        classpath '${newrelicClassPath}:${newrelicAndroidVersion}'`,
    );
  }

  return buildGradle;
}