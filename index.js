/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

import utils from './new-relic/nr-utils';
import { LOG } from './new-relic/nr-logger';
import { Platform } from 'react-native';
import NRMAModularAgentWrapper from './new-relic/nrma-modular-agent-wrapper';
import version from './new-relic/version';
import forEach from 'lodash.foreach';
import getCircularReplacer from './new-relic/circular-replacer';

import {
  getUnhandledPromiseRejectionTracker,
  setUnhandledPromiseRejectionTracker,
} from 'react-native-promise-rejection-utils'


/**
 * New Relic
 */
class NewRelic {
  constructor() {
    this.JSAppVersion = '';
    this.state = {
      didAddErrorHandler: false,
      didAddPromiseRejection: false,
      didOverrideConsole: false,
      isFirstScreen: true
    };
    this.lastScreen = '';
    this.LOG = LOG;
    this.NRMAModularAgentWrapper = new NRMAModularAgentWrapper();
    this.agentVersion = version;
    this.agentConfiguration = {
      analyticsEventEnabled: true,
      nativeCrashReportingEnabled: true,
      crashReportingEnabled: true,
      interactionTracingEnabled: false,
      networkRequestEnabled: true,
      networkErrorRequestEnabled: true,
      httpResponseBodyCaptureEnabled: true,
      loggingEnabled: true,
      logLevel: this.LogLevel.INFO,
      webViewInstrumentation: true,
      collectorAddress: "",
      crashCollectorAddress: "",
      fedRampEnabled: false,
      offlineStorageEnabled: true,
      backgroundReportingEnabled: false,
      newEventSystemEnabled: true
    };
  }

  LogLevel = {
    // ERROR is least verbose and AUDIT is most verbose
    ERROR: "ERROR",
    WARNING: "WARNING",
    INFO: "INFO",
    VERBOSE: "VERBOSE",
    AUDIT: "AUDIT"
  };

  NetworkFailure = {
    Unknown: 'Unknown',
    BadURL: 'BadURL',
    TimedOut: 'TimedOut',
    CannotConnectToHost: 'CannotConnectToHost', 
    DNSLookupFailed: 'DNSLookupFailed',
    BadServerResponse: 'BadServerResponse',
    SecureConnectionFailed: 'SecureConnectionFailed'
  }

  MetricUnit = {
    PERCENT: 'PERCENT',
    BYTES: 'BYTES',
    SECONDS: 'SECONDS', 
    BYTES_PER_SECOND: 'BYTES_PER_SECOND',
    OPERATIONS: 'OPERATIONS'
  }

  /**
   * True if native agent is started. False if native agent is not started.
   * @returns {boolean}
   */
  isAgentStarted = () => NRMAModularAgentWrapper.isAgentStarted;

  /**
  * Navigation Route Listener
  */
  /**
   * Subcribe onNavigationStateChange Listenr from React Navigation Version 4.x and lower
 =
    * Creates and records a MobileBreadcrumb for Current Screen
    */
  onNavigationStateChange = (prevState, newState, action) => {

    var currentScreenName = this.getCurrentRouteName(newState);
    var params = {
      'screenName': currentScreenName
    };

    this.recordBreadcrumb('navigation', params);

  }

  getCurrentRouteName = (currentState) => {
    if (!currentState) {
      return null;
    }
    const route = currentState.routes[currentState.index];
    if (route.routes) {
      return this.getCurrentRouteName(route);
    }
    return route.routeName;
  }
  /**
   * Subcribe componentDidAppearListener Listenr from React Native Navigation Package
   * Creates and records a MobileBreadcrumb for Current Screen
   */
  componentDidAppearListener = (event) => {
    if (this.state.isFirstScreen) {
      this.lastScreen = event.componentName;
      this.state.isFirstScreen = false;
      return;
    }
    if (this.lastScreen != event.componentName) {
      var currentScreenName = event.componentName;
      this.lastScreen = currentScreenName;
      var params = {
        'screenName': currentScreenName
      };

      this.recordBreadcrumb('navigation', params);
    }
  }

  /**
   * Subcribe OnStateChange Listenr from React Navigation Version 5.x and higer
  * Creates and records a MobileBreadcrumb for Current Screen
  */
  onStateChange = (state) => {
    var currentScreenName = this.getCurrentScreen(state);
    var params = {
      'screenName': currentScreenName
    };

    this.recordBreadcrumb('navigation', params);

  }

  getCurrentScreen(state) {

    if (!state.routes[state.index].state) {
      return state.routes[state.index].name
    }
    return this.getCurrentScreen(state.routes[state.index].state);
  }

  /**
   * Start the agent
   */
  startAgent(appkey, customerConfiguration) {
    this.LOG.verbose = true; // todo: should let this get set by a param
    this.config = Object.assign(this.agentConfiguration, customerConfiguration);
    this.NRMAModularAgentWrapper.startAgent(appkey, this.agentVersion, this.getReactNativeVersion(), this.config);
    this.addNewRelicErrorHandler();
    this.addNewRelicPromiseRejectionHandler();
    this._overrideConsole();
    //this.enableNetworkInteraction();
    this.LOG.info('React Native agent started.');
    this.LOG.info(`New Relic React Native agent version ${this.agentVersion}`);
    this.setAttribute('ReactNativeAgentVersion', this.agentVersion);
    this.setAttribute('JSEngine', global.HermesInternal ? "Hermes" : "JavaScriptCore");


  }
  getReactNativeVersion() {
    var rnVersion = Platform.constants.reactNativeVersion;
    return `${rnVersion.major}.${rnVersion.minor}.${rnVersion.patch}`
  }

  /**
   * FOR ANDROID ONLY.
   * Enable or disable collection of event data.
   * @param enabled {boolean} Boolean value for enabling analytics events.
   */
  analyticsEventEnabled(enabled) {
    this.NRMAModularAgentWrapper.execute('analyticsEventEnabled', enabled);
  }
  
  /**
   * Enable or disable reporting successful HTTP requests to the MobileRequest event type.
   * @param enabled {boolean} Boolean value for enabling successful HTTP requests.
   */
  networkRequestEnabled(enabled) {
    this.NRMAModularAgentWrapper.execute('networkRequestEnabled', enabled);
  }

  /**
   * Enable or disable reporting network and HTTP request errors to the MobileRequestError event type.
   * @param enabled {boolean} Boolean value for enabling network request errors.
   */
  networkErrorRequestEnabled(enabled) {
    this.NRMAModularAgentWrapper.execute('networkErrorRequestEnabled', enabled);
  }

  /**
   * Enable or disable capture of HTTP response bodies for HTTP error traces, and MobileRequestError events.
   * @param enabled {boolean} Boolean value for enabling HTTP response bodies.
   */
  httpResponseBodyCaptureEnabled(enabled) {
    this.NRMAModularAgentWrapper.execute('httpResponseBodyCaptureEnabled', enabled);
  }
  
  /**
   * Creates and records a MobileBreadcrumb event
   * @param eventName {string} the name you want to give to the breadcrumb event.
   * @param attributes {Map<string, any>} a map that includes a list of attributes.
   */
  recordBreadcrumb(eventName, attributes) {
    attributes = attributes instanceof Map ? Object.fromEntries(attributes):attributes;
    this.NRMAModularAgentWrapper.execute('recordBreadcrumb', eventName, attributes);
  }

  /**
   * Creates and records a custom event, for use in New Relic Insights.
   * The event includes a list of attributes, specified as a map.
   * @param eventType {string} The type of event.
   * @param eventName {string} Use this parameter to name the event.
   * @param attributes {Map<string, any>} A map that includes a list of attributes.
   */
  recordCustomEvent(eventType, eventName, attributes) {
    attributes = attributes instanceof Map ? Object.fromEntries(attributes):attributes;
    this.NRMAModularAgentWrapper.execute('recordCustomEvent', eventType, eventName, attributes);
  }

   /**
   * Throws a demo run-time exception to test New Relic crash reporting.
   * @param message {string} Optional argument attached to the exception.
   */
  crashNow(message='') {
    this.NRMAModularAgentWrapper.execute('crashNow', message);
  }
  
  /**
   * Returns the current session ID. 
   * This method is useful for consolidating monitoring of app data (not just New Relic data) based on a single session definition and identifier.
   * @return currentSessionId {Promise} A promise that returns the current session id.
   */
  async currentSessionId() {
    return await this.NRMAModularAgentWrapper.execute('currentSessionId');
  }

  /**
   * Tracks network requests manually.
   * You can use this method to record HTTP transactions, with an option to also send a response body.
   * @param url {string} The URL of the request.
   * @param httpMethod {string} The HTTP method used, such as GET or POST
   * @param statusCode {number} The statusCode of the HTTP response, such as 200 for OK.
   * @param startTime {number} The start time of the request in milliseconds since the epoch.
   * @param endTime {number} The end time of the request in milliseconds since the epoch.
   * @param bytesSent {number} The number of bytes sent in the request.
   * @param bytesReceived {number} The number of bytes received in the response
   * @param responseBody {string} The response body of the HTTP response. The response body will be truncated and included in an HTTP Error metric if the HTTP transaction is an error.
   */
  noticeHttpTransaction(url, httpMethod, statusCode, startTime, endTime, bytesSent, bytesReceived, responseBody) {
    this.NRMAModularAgentWrapper.execute('noticeHttpTransaction', url, httpMethod, statusCode, startTime, endTime, bytesSent, bytesReceived, responseBody);
  }

    /**
   * Add Headers as Attributes in Http Requests, for use in New Relic Insights.
   * The method includes a list of headers, specified as a map.
   * @param headers {Map<string, any>} A map that includes a list of headers.
   */
    addHTTPHeadersTrackingFor(headers) {
      this.NRMAModularAgentWrapper.execute('addHTTPHeadersTrackingFor', headers);
    }

  /**
   * Records network failures.
   * If a network request fails, use this method to record details about the failure.
   * In most cases, place this call inside exception handlers.
   * @param url {string} The URL of the request.
   * @param httpMethod {string} The HTTP method used, such as GET or POST.
   * @param startTime {number} The start time of the request in milliseconds since the epoch.
   * @param endTime {number} The end time of the request in milliseconds since the epoch.
   * @param failure {string} Name of the network failure. Possible values are in NewRelic.NetworkFailure.
   */
  noticeNetworkFailure(url, httpMethod, startTime, endTime, failure) {
    this.NRMAModularAgentWrapper.execute('noticeNetworkFailure', url, httpMethod, startTime, endTime, failure);
  }

  /**
   * Records custom metrics (arbitrary numerical data).
   * @param name {string} The name for the custom metric.
   * @param category {string} The metric category name. 
   * @param value {number} Optional. The value of the metric. Value should be a non-zero positive number. 
   * @param countUnit {string} Optional (but requires value and valueUnit to be set). Unit of measurement for the metric count. Supported values are in NewRelic.MetricUnit.
   * @param valueUnit {string} Optional (but requires value and countUnit to be set). Unit of measurement for the metric value. Supported values are in NewRelic.MetricUnit. 
   */
  recordMetric(name, category, value=-1, countUnit=null, valueUnit=null) {
    this.NRMAModularAgentWrapper.execute('recordMetric', name, category, value, countUnit, valueUnit);
  }


  /**
   * Removes all attributes from the session.
   */
  removeAllAttributes() {
    this.NRMAModularAgentWrapper.execute('removeAllAttributes');
  }

  /**
   * Records javascript errors for react-native.
   * @param e {Error} A JavaScript error.
   */
  async recordError(e) {
    await this.recordError(e, false);
  }
  async recordError(e, isFatal) {
    if(e) {
      if(!this.JSAppVersion) {
        this.LOG.error('unable to capture JS error. Make sure to call NewRelic.setJSAppVersion() at the start of your application.');
      }

      var error;

      if(e instanceof Error) {
        error = e;
      }

      if(typeof e === 'string') {
        error = new Error(e || '');
      }

      if(error !== undefined) {
        this.NRMAModularAgentWrapper.execute("recordHandledException", error, this.JSAppVersion, isFatal)
      } else {
        this.LOG.warn('undefined error name or message');
      }
    } else {
      this.LOG.warn('error is required');
    }
  }

  /***
   * Sets the event harvest cycle length.
   * Default is 600 seconds (10 minutes).
   * Minimum value cannot be less than 60 seconds.
   * Maximum value should not be greater than 600 seconds.
   * @param maxBufferTimeInSeconds {number} The maximum time (in seconds) that the agent should store events in memory.
   */
  setMaxEventBufferTime(maxBufferTimeInSeconds) {
    this.NRMAModularAgentWrapper.execute('setMaxEventBufferTime', maxBufferTimeInSeconds);
  }

  /**
   * Sets the maximum size of the event pool stored in memory until the next harvest cycle.
   * When the pool size limit is reached, the agent will start sampling events, discarding some new and old, until the pool of events is sent in the next harvest cycle.
   * Default is a maximum of 1000 events per event harvest cycle.
   * @param maxSize {number} The maximum number of events per harvest cycle.
   */
  setMaxEventPoolSize(maxSize) {
    this.NRMAModularAgentWrapper.execute('setMaxEventPoolSize', maxSize);
  }

    /**
   * Sets the maximum size of total data that can be stored for offline storage.By default, mobile monitoring can collect a maximum of 100 megaBytes of offline storage. 
   * When a data payload fails to send because the device doesn't have an internet connection, it can be stored in the file system until an internet connection has been made. 
   * After a typical harvest payload has been successfully sent, all offline data is sent to New Relic and cleared from storage.
   * @param megaBytes {number} Maximum size in megaBytes that can be stored in the file system..
   */
    setMaxOfflineStorageSize(megaBytes) {
      this.NRMAModularAgentWrapper.execute('setMaxOfflineStorageSize', megaBytes);
    }

  /**
 * Track a method as an interaction
 */
  async startInteraction(actionName) {
    if (utils.notEmptyString(actionName)) {
      return await this.NRMAModularAgentWrapper.startInteraction(actionName);
    } else {
      this.LOG.warn(`actionName is required`);
    }
  }

  /**
 * End an interaction
 * Required. The string ID for the interaction you want to end.
 * This string is returned when you use startInteraction().
 */

  endInteraction(interActionId) {
    if (utils.notEmptyString(interActionId)) {
      this.NRMAModularAgentWrapper.execute('endInteraction', interActionId);
    } else {
      this.LOG.warn(`interActionId is Required`);
    }
  }


  /**
 * ANDROID ONLY
 * Name or rename an interaction
 */

  setInteractionName(name) {
    if (Platform.OS === 'android') {
      this.NRMAModularAgentWrapper.execute('setInteractionName', name);
    } else {
      this.LOG.info(`setInterActionName is not supported by iOS Agent`);
    }
  }


  /**
   * Creates a custom attribute with a specified name and value.
   * When called, it overwrites its previous value and type.
   * The created attribute is shared by multiple Mobile event types.
   * @param attributeName {string} Name of the attribute.
   * @param value {string|number|boolean}
   */
  setAttribute(attributeName, value) {
    this.NRMAModularAgentWrapper.execute('setAttribute', attributeName, value);
  }

  /**
 * Remove a custom attribute with a specified name and value.
 * When called, it removes the attribute specified by the name string.
 * The removed attribute is shared by multiple Mobile event types.
 * @param attributeName {string} Name of the attribute.
 */
  removeAttribute(attributeName) {
    this.NRMAModularAgentWrapper.execute('removeAttribute', attributeName);
  }

  /**
   * Increments the count of an attribute with a specified name.
   * When called, it overwrites its previous value and type each time.
   * If attribute does not exist, it creates an attribute with a value of 1.
   * The incremented attribute is shared by multiple Mobile event types.
   * @param attributeName {string} Name of the Attribute.
   * @param value {number} Optional argument that increments the attribute by this value.
   */
  incrementAttribute(attributeName, value=1) {
    this.NRMAModularAgentWrapper.execute('incrementAttribute', attributeName, value);
  }

  /**
   * Sets the js release version
   * @param version {string}
   */
  setJSAppVersion(version) {
    if (utils.isString(version)) {
      this.JSAppVersion = version;
      this.NRMAModularAgentWrapper.execute('setJSAppVersion', version);
      return;
    }

    this.LOG.error(`JSAppVersion '${version}' is not a string.`);
  }

  /**
   * Sets a custom user identifier value to associate mobile user
   * @param userId {string}
   */
  setUserId(userId) {
    if (utils.isString(userId)) {
      this.NRMAModularAgentWrapper.execute('setUserId', userId);
    } else {
      this.LOG.error(`userId '${userId}' is not a string.`);
    }
  }

  /**
   * Shut down the agent within the current application lifecycle during runtime.
   */
  shutdown() {
    this.NRMAModularAgentWrapper.execute('shutdown');
  }

  /**
   * @private
   */
  addNewRelicErrorHandler() {
    if (global && global.ErrorUtils && !this.state.didAddErrorHandler) {
      const previousHandler = global.ErrorUtils.getGlobalHandler();
      global.ErrorUtils.setGlobalHandler(async (error, isFatal) => {
        if (!this.JSAppVersion) {
          this.LOG.error('unable to capture JS error. Make sure to call NewRelic.setJSAppVersion() at the start of your application.');
        }
        await this.recordError(error, isFatal);
        previousHandler(error, isFatal);
      });
      // prevent us from adding the error handler multiple times.
      this.state.didAddErrorHandler = true;
    } else if (!this.state.didAddErrorHandler) {
      this.LOG.debug('failed to add New Relic error handler no error utils detected');
    }
  }

  addNewRelicPromiseRejectionHandler() {

    const prevTracker = getUnhandledPromiseRejectionTracker();

    if (!this.state.didAddPromiseRejection) {
      setUnhandledPromiseRejectionTracker(async (id, error) => {
        if(error != undefined) {
          await this.recordError(error);
        } else {
          this.recordBreadcrumb("Possible Unhandled Promise Rejection", {id: id})
        }

        if (prevTracker !== undefined) {
          prevTracker(id, error)
        }

      });
      this.state.didAddPromiseRejection = true;

    }

  }

  _overrideConsole() {
    if (!this.state.didOverrideConsole) {
      const defaultLog = console.log;
      const defaultWarn = console.warn;
      const defaultError = console.error;
      const self = this;

      console.log = function () {
        self.sendConsole('log', arguments);
        defaultLog.apply(console, arguments);
      };
      console.warn = function () {
        self.sendConsole('warn', arguments);
        defaultWarn.apply(console, arguments);
      };
      console.error = function () {
        self.sendConsole('error', arguments);
        defaultError.apply(console, arguments);
      };
      this.state.didOverrideConsole = true;
    }
  }

  sendConsole(type, args) {
    const argsStr = JSON.stringify(args, getCircularReplacer());
    this.send('JSConsole', { consoleType: type, args: argsStr });
  }

  send(name, args) {
    const nameStr = String(name);
    const argsStr = {};
    forEach(args, (value, key) => {
      argsStr[String(key)] = String(value);
    });
    this.NRMAModularAgentWrapper.execute('recordCustomEvent', 'consoleEvents', nameStr, argsStr);
  }

}
const byteSize = str => new Blob([str]).size;

const newRelic = new NewRelic();
export default newRelic;


