"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withNetworkAcessPermission = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const constants_1 = require("./constants");
/**
 * Update `app/build.gradle` by applying newrelic plugin
 */
const withNetworkAcessPermission = config => {
    return (0, config_plugins_1.withAndroidManifest)(config, async (config) => {
        let androidManifest = config.modResults;
        config_plugins_1.AndroidConfig.Permissions.addPermission(androidManifest, constants_1.networkAcessStatePermission);
        return config;
    });
};
exports.withNetworkAcessPermission = withNetworkAcessPermission;
