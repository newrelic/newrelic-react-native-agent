/**
 * @format
 */

import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import NewRelic from 'newrelic-react-native-agent';
import * as appVersion from './package.json';

// Replace these with the application tokens from your New Relic mobile entity.
const appToken = Platform.select({
  ios: 'REPLACE_WITH_YOUR_IOS_APP_TOKEN',
  android: 'REPLACE_WITH_YOUR_ANDROID_APP_TOKEN',
});

const agentConfiguration = {
  analyticsEventEnabled: true,
  crashReportingEnabled: true,
  interactionTracingEnabled: true,
  networkRequestEnabled: true,
  networkErrorRequestEnabled: true,
  httpResponseBodyCaptureEnabled: true,
  loggingEnabled: true,
  logLevel: NewRelic.LogLevel.INFO,
  webViewInstrumentation: true,
};

NewRelic.startAgent(appToken, agentConfiguration);
NewRelic.setJSAppVersion(appVersion.version);

AppRegistry.registerComponent(appName, () => App);
