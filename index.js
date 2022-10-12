/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

import utils from './new-relic/nr-utils';
import { LOG } from './new-relic/nr-logger';
import { Platform } from 'react-native';
import NRMAModularAgentWrapper from './new-relic/nrma-modular-agent-wrapper';
import version from './new-relic/version';
import * as _ from 'lodash';

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
      crashReportingEnabled: true,
      interactionTracingEnabled: true,
      networkRequestEnabled: true,
      networkErrorRequestEnabled: true,
      httpRequestBodyCaptureEnabled: true,
      loggingEnabled: true,
      webViewInstrumentation: true
    };
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
      return getActiveRouteName(route);
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
    var currentScreenName = this.getCurrentScrren(state);
    var params = {
      'screenName': currentScreenName
    };

    this.recordBreadcrumb('navigation', params);

  }

  getCurrentScrren(state) {

    if (!state.routes[state.index].state) {
      return state.routes[state.index].name
    }
    return this.getCurrentScrren(state.routes[state.index].state);
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
  httpRequestBodyCaptureEnabled(enabled) {
    this.NRMAModularAgentWrapper.execute('httpRequestBodyCaptureEnabled', enabled);
  }
  
  /**
   * Creates and records a MobileBreadcrumb event
   * @param eventName {string} the name you want to give to the breadcrumb event.
   * @param attributes {Map<string, string|number>} a map that includes a list of attributes.
   */
  recordBreadcrumb(eventName, attributes) {
    this.NRMAModularAgentWrapper.execute('recordBreadcrumb', eventName, attributes);
  }

  /**
   * Creates and records a custom event, for use in New Relic Insights.
   * The event includes a list of attributes, specified as a map.
   * @param eventType {string} The type of event.
   * @param eventName {string} Use this parameter to name the event.
   * @param attributes {Map<string, string|number>} A map that includes a list of attributes.
   */
  recordCustomEvent(eventType, eventName, attributes) {
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
   * Records network failures.
   * If a network request fails, use this method to record details about the failure.
   * In most cases, place this call inside exception handlers.
   * @param url {string} The URL of the request.
   * @param httpMethod {string} The HTTP method used, such as GET or POST.
   * @param startTime {number} The start time of the request in milliseconds since the epoch.
   * @param endTime {number} The end time of the request in milliseconds since the epoch.
   * @param failure {string} Name of the network failure. Possible values are 'Unknown', 'BadURL', 'TimedOut', 'CannotConnectToHost', 'DNSLookupFailed', 'BadServerResponse', 'SecureConnectionFailed'.
   */
  noticeNetworkFailure(url, httpMethod, startTime, endTime, failure) {
    this.NRMAModularAgentWrapper.execute('noticeNetworkFailure', url, httpMethod, startTime, endTime, failure);
  }

  /**
   * Records custom metrics (arbitrary numerical data).
   * @param name {string} The name for the custom metric.
   * @param category {string} The metric category name. 
   * @param value {number} Optional. The value of the metric. Value should be a non-zero positive number. 
   * @param countUnit {string} Optional (but requires value and valueUnit to be set). Unit of measurement for the metric count. Supported values are 'PERCENT', 'BYTES', 'SECONDS', 'BYTES_PER_SECOND', or 'OPERATIONS'.
   * @param valueUnit {string} Optional (but requires value and countUnit to be set). Unit of measurement for the metric value. Supported values are 'PERCENT', 'BYTES', 'SECONDS', 'BYTES_PER_SECOND', or 'OPERATIONS'. 
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
   */
  recordError(e) {
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
        this.NRMAModularAgentWrapper.execute(
          "recordStack",
          error.name,
          error.message,
          error.stack,
          false,
          this.JSAppVersion)
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
    this.NRMAModularAgentWrapper.execute('removeAttribute', attributeName, value);
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
   * @private
   */
  addNewRelicErrorHandler() {
    if (global && global.ErrorUtils && !this.state.didAddErrorHandler) {
      const previousHandler = global.ErrorUtils.getGlobalHandler();
      global.ErrorUtils.setGlobalHandler((error, isFatal) => {
        if (!this.JSAppVersion) {
          this.LOG.error('unable to capture JS error. Make sure to call NewRelic.setJSAppVersion() at the start of your application.');
        }
        this.NRMAModularAgentWrapper.execute('recordStack',
          error.name,
          error.message,
          error.stack,
          isFatal,
          this.JSAppVersion);
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
      setUnhandledPromiseRejectionTracker((id, error) => {

        this.NRMAModularAgentWrapper.execute('recordStack',
          error.name,
          error.message,
          error.stack,
          false,
          this.JSAppVersion);

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
    const argsStr = JSON.stringify(args);
    this.send('JSConsole', { consoleType: type, args: argsStr });
    // if (type === 'error') {
    //   this.NRMAModularAgentWrapper.execute('consoleEvents','[JSConsole:Error] ' + argsStr); 
    // }
  }

  send(name, args) {
    const nameStr = String(name);
    const argsStr = {};
    _.forEach(args, (value, key) => {
      argsStr[String(key)] = String(value);
    });
    this.NRMAModularAgentWrapper.execute('recordCustomEvent', 'consoleEvents', nameStr, argsStr);
  }

}
const byteSize = str => new Blob([str]).size;

const newRelic = new NewRelic();
export default newRelic;


