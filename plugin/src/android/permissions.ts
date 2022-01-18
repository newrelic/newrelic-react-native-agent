import { AndroidConfig, ConfigPlugin, WarningAggregator, withAppBuildGradle,withAndroidManifest } from '@expo/config-plugins';

import { networkAcessStatePermission } from './constants';

/**
 * Update `app/build.gradle` by applying newrelic plugin
 */
export const withNetworkAcessPermission: ConfigPlugin = config => {

    return withAndroidManifest(config, async config => {
        let androidManifest = config.modResults

        AndroidConfig.Permissions.addPermission(androidManifest,networkAcessStatePermission);
    
        return config
      })
  
};
