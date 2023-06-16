/**
 * @format
 */

import { AppRegistry } from 'react-native';
import NewRelic from 'newrelic-react-native-agent';
import App from './App';
import { name as appName } from './app.json';
import * as appVersion from './package.json';

let appToken;

if (Platform.OS === 'ios') {
  appToken = '<IOS-APP-TOKEN>';
} else {
  appToken = '<ANDROID-APP-TOKEN>';
}

const agentConfiguration = {
  //Android Specific
  // Optional:Enable or disable collection of event data.
  analyticsEventEnabled: true,

  // Optional:Enable or disable crash reporting.
  crashReportingEnabled: true,

  // Optional:Enable or disable interaction tracing. Trace instrumentation still occurs, but no traces are harvested. This will disable default and custom interactions.
  interactionTracingEnabled: true,

  // Optional:Enable or disable reporting successful HTTP requests to the MobileRequest event type.
  networkRequestEnabled: true,

  // Optional:Enable or disable reporting network and HTTP request errors to the MobileRequestError event type.
  networkErrorRequestEnabled: true,

  // Optional:Enable or disable capture of HTTP response bodies for HTTP error traces, and MobileRequestError events.
  httpResponseBodyCaptureEnabled: true,

  // Optional:Enable or disable agent logging.
  loggingEnabled: true,

  // Optional:Specifies the log level. Omit this field for the default log level.
  // Options include: ERROR (least verbose), WARNING, INFO, VERBOSE, AUDIT (most verbose).
  logLevel: NewRelic.LogLevel.INFO,

  // iOS Specific
  // Optional:Enable/Disable automatic instrumentation of WebViews
  webViewInstrumentation: true,

  // Optional:Set a specific collector address for sending data. Omit this field for default address.
  //collectorAddress: "",

  // Optional:Set a specific crash collector address for sending crashes. Omit this field for default address.
  //crashCollectorAddress: "",

  // Optional:Enable or disable reporting data using different endpoints for US government clients.
  //fedRampEnabled: false
};

NewRelic.startAgent(appToken, agentConfiguration);
NewRelic.setJSAppVersion(appVersion.version);

AppRegistry.registerComponent(appName, () => App);
