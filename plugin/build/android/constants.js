"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networkAcessStatePermission = exports.newrelicAndroidVersion = exports.newrelicPlugin = exports.newrelicClassPath = void 0;
const projectPackage = require('newrelic-react-native-agent/package.json');
exports.newrelicClassPath = 'com.newrelic.agent.android:agent-gradle-plugin';
exports.newrelicPlugin = 'newrelic';
exports.newrelicAndroidVersion = projectPackage.sdkVersions.android.newrelic;
exports.networkAcessStatePermission = 'android.permission.ACCESS_NETWORK_STATE';
