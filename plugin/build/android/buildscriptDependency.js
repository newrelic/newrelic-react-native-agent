"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBuildscriptDependency = exports.withBuildscriptDependency = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const constants_1 = require("./constants");
/**
 * Update `<project>/build.gradle` by adding NewRelic dependency to buildscript
 */
const withBuildscriptDependency = config => {
    return (0, config_plugins_1.withProjectBuildGradle)(config, config => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = setBuildscriptDependency(config.modResults.contents);
        }
        else {
            config_plugins_1.WarningAggregator.addWarningAndroid('newrelic-react-native-agent', `Cannot automatically configure project build.gradle if it's not groovy`);
        }
        return config;
    });
};
exports.withBuildscriptDependency = withBuildscriptDependency;
function setBuildscriptDependency(buildGradle) {
    if (!buildGradle.includes(constants_1.newrelicClassPath)) {
        return buildGradle.replace(/dependencies\s?{/, `dependencies {
        classpath '${constants_1.newrelicClassPath}:${constants_1.newrelicAndroidVersion}'`);
    }
    return buildGradle;
}
exports.setBuildscriptDependency = setBuildscriptDependency;
