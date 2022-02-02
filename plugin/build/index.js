"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const android_1 = require("./android");
const projectPackage = require('newrelic-react-native-agent/package.json');
/**
 * A config plugin for configuring `newrelic-react-native-agent`
 */
const withNewRelicRNAgent = config => {
    return (0, config_plugins_1.withPlugins)(config, [android_1.withBuildscriptDependency, android_1.withApplyNewRelicPlugin, android_1.withNetworkAcessPermission]);
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(withNewRelicRNAgent, projectPackage.name, projectPackage.version);
