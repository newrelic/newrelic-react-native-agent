import { ConfigPlugin } from '@expo/config-plugins';
/**
 * Update `app/build.gradle` by applying newrelic plugin
 */
export declare const withApplyNewRelicPlugin: ConfigPlugin;
export declare function applyPlugin(appBuildGradle: string): string;
