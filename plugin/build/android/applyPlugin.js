"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPlugin = exports.withApplyNewRelicPlugin = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const constants_1 = require("./constants");
/**
 * Update `app/build.gradle` by applying newrelic plugin
 */
const withApplyNewRelicPlugin = config => {
    return (0, config_plugins_1.withAppBuildGradle)(config, config => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = applyPlugin(config.modResults.contents);
        }
        else {
            config_plugins_1.WarningAggregator.addWarningAndroid('newrelic-react-native-agent', `Cannot automatically configure app build.gradle if it's not groovy`);
        }
        return config;
    });
};
exports.withApplyNewRelicPlugin = withApplyNewRelicPlugin;
function applyPlugin(appBuildGradle) {
    // Make sure the project does not have the plugin already
    const pattern = new RegExp(`apply\\s+plugin:\\s+['"]${constants_1.newrelicPlugin}['"]`);
    if (!appBuildGradle.match(pattern)) {
        return appBuildGradle + `\napply plugin: '${constants_1.newrelicPlugin}'`;
    }
    return appBuildGradle;
}
exports.applyPlugin = applyPlugin;
