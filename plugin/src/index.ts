/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';

import { withApplyNewRelicPlugin, withBuildscriptDependency, withNetworkAcessPermission } from './android';

const projectPackage = require('newrelic-react-native-agent/package.json');

/**
 * A config plugin for configuring `newrelic-react-native-agent`
 */
const withNewRelicRNAgent: ConfigPlugin = config => {
  return withPlugins(config, [withBuildscriptDependency, withApplyNewRelicPlugin,withNetworkAcessPermission]);
};

export default createRunOncePlugin(withNewRelicRNAgent,projectPackage.name, projectPackage.version);