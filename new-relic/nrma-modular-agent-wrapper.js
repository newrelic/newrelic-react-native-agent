/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

import { NativeModules } from 'react-native';
import utils from './nr-utils';
import { LOG } from './nr-logger';
import { Attribute, BreadCrumb, NewRelicEvent } from './models';
import StackFrameEditor from './stack-frame-editor';
const isTurboModuleEnabled = global.__turboModuleProxy != null;
const NRMModularAgent = isTurboModuleEnabled ?
require("./spec/NativeNewRelicModule").default:NativeModules.NRMModularAgent;

class NRMAModularAgentWrapper {
  static isAgentStarted = false;

  constructor() {
    this.didCheck = false;
  }

  hasMethod(name) {
    return !!this[name];
  }

  execute(...args) {
    const agentFailedToStartMsg = "Critical error with the agent -- failed to start. Please check your app setup.";
    const name = args[0];
    // might need to age this out at some point? check if it get stale
    if (NRMModularAgent == null) {
      return LOG.error(
        "Agent is not correctly installed. Be sure to link the agent before attempting to use it."
      );
    }

    if (NRMAModularAgentWrapper.isAgentStarted) {
      return this.hasMethod(name) && this[name](...[].slice.call(args, 1));
    }

    if (this.didCheck && !NRMAModularAgentWrapper.isAgentStarted) {
      return LOG.error(agentFailedToStartMsg);
    }

    return NRMModularAgent.isAgentStarted().then((isRunning) =>{
      this.didCheck = true;
      if (isRunning) {
        NRMAModularAgentWrapper.isAgentStarted = isRunning;
        return this.hasMethod(name) && this[name](...[].slice.call(args, 1));
      }
      return LOG.error(agentFailedToStartMsg);
    });
  }

  analyticsEventEnabled = (enabled) => {
    NRMModularAgent.analyticsEventEnabled(enabled);
  };

  networkRequestEnabled = (enabled) => {
    NRMModularAgent.networkRequestEnabled(enabled);
  };

  networkErrorRequestEnabled = (enabled) => {
    NRMModularAgent.networkErrorRequestEnabled(enabled);
  };

  httpResponseBodyCaptureEnabled = (enabled) => {
    NRMModularAgent.httpResponseBodyCaptureEnabled(enabled);
  };

  recordBreadcrumb = (eventName, attributes) => {
    const crumb = new BreadCrumb({ eventName, attributes });
    crumb.attributes.isValid(() => {
      crumb.eventName.isValid(() => {
        NRMModularAgent.recordBreadcrumb(eventName, attributes);
      });
    });
  };

  recordCustomEvent = (eventType, eventName = '', attributes = {}) => {
    const customEvent = new NewRelicEvent({ eventType, eventName, attributes });
    customEvent.attributes.isValid(() => {
      if (customEvent.eventName.isValid() && customEvent.eventType.isValid()) {
        NRMModularAgent.recordCustomEvent(eventType, eventName, attributes);
      } else {
        LOG.error("Invalid event name or type in recordCustomEvent");
      }
    });
  };

  logAttributes = (attributes = {}) => {
    if(attributes.size === 0) {
      LOG.error("Attributes are empty in logAttributes");
    } else {
      NRMModularAgent.logAttributes(attributes);
    }
  };

  crashNow = (message) => {
    NRMModularAgent.crashNow(message);
  };

  currentSessionId = async () => {
    if(NRMAModularAgentWrapper.isAgentStarted) {
      return await NRMModularAgent.currentSessionId();
     }
  };

  noticeNetworkFailure = (url, httpMethod, startTime, endTime, failure) => {
    const failureNames = new Set(['Unknown', 'BadURL', 'TimedOut', 'CannotConnectToHost', 'DNSLookupFailed', 'BadServerResponse', 'SecureConnectionFailed']);
    if(!failureNames.has(failure)) {
      LOG.error("Network failure name has to be one of: 'Unknown', 'BadURL', 'TimedOut', 'CannotConnectToHost', 'DNSLookupFailed', 'BadServerResponse', 'SecureConnectionFailed'");
      return;
    }
    NRMModularAgent.noticeNetworkFailure(url, httpMethod, startTime, endTime, failure);
  };

  recordMetric = (name, category, value, countUnit, valueUnit) => {
    const metricUnits = new Set(['PERCENT', 'BYTES', 'SECONDS', 'BYTES_PER_SECOND', 'OPERATIONS']);
    if(value < 0) {
      if(countUnit !== null || valueUnit !== null) {
        LOG.error('value must be set in recordMetric if countUnit and valueUnit are set');
        return;
      }
    } else {
      if((countUnit !== null && valueUnit == null) || (countUnit == null && valueUnit !== null)) {
        LOG.error('countUnit and valueUnit in recordMetric must both be null or set');
        return;
      } else if(countUnit !== null && valueUnit !== null) {
        if(!metricUnits.has(countUnit) || !metricUnits.has(valueUnit)) {
          LOG.error("countUnit or valueUnit in recordMetric has to be one of 'PERCENT', 'BYTES', 'SECONDS', 'BYTES_PER_SECOND', 'OPERATIONS'");
          return;
        }
      }
    }
    NRMModularAgent.recordMetric(name, category, value, countUnit, valueUnit);
  };

  removeAllAttributes = () => {
    NRMModularAgent.removeAllAttributes();
  };

  setMaxEventBufferTime = (maxBufferTimeInSeconds) => {
    NRMModularAgent.setMaxEventBufferTime(maxBufferTimeInSeconds);
  };

  setMaxEventPoolSize = (maxSize) => {
    NRMModularAgent.setMaxEventPoolSize(maxSize);
  };
  
  setMaxOfflineStorageSize = (megaBytes) => {
    NRMModularAgent.setMaxOfflineStorageSize(megaBytes);
  };


  setAttribute = (attributeName, value) => {
    const attribute = new Attribute({ attributeName, value });

    attribute.attributeName.isValid(() => {
      attribute.attributeValue.isValid(() => {
        if (utils.isString(value)) {
          NRMModularAgent.setStringAttribute(attributeName, value);
          return;
        }

        if (utils.isNumber(value) && !utils.isBool(value)) {
          NRMModularAgent.setNumberAttribute(attributeName, value);
          return;
        }

        if (utils.isBool(value)) {
          NRMModularAgent.setBoolAttribute(attributeName, value);
          return;
        }

        LOG.error(`invalid value '${value}' sent to setAttribute()`);
      });
    });
  };

  removeAttribute = (attributeName) => {
    NRMModularAgent.removeAttribute(attributeName);
  };

  incrementAttribute = (attributeName, value) => {
    const attribute = new Attribute({ attributeName, value });

    attribute.attributeName.isValid(() => {
      attribute.attributeValue.isValid(() => {
        if (utils.isNumber(value) && !utils.isBool(value)) {
          return NRMModularAgent.incrementAttribute(attributeName, value);
        }

        LOG.error(`invalid value '${value}' sent to incrementAttribute()`);
      });
    });
  };

  setJSAppVersion = (version) => {
    NRMModularAgent.setJSAppVersion(version);
  };

  addHTTPHeadersTrackingFor = (headers) => {
    NRMModularAgent.addHTTPHeadersTrackingFor(headers);
  };

  setUserId = (userId) => {
    NRMModularAgent.setUserId(userId);
  };

  recordStack = (name, message, stack, isFatal, JSAppVersion) => {
    NRMModularAgent.recordStack(name, message, stack, isFatal, JSAppVersion);
  };


  noticeHttpTransaction = (url,method,status,startTime,endTime,bytesSent,bytesReceived,response) => {
    NRMModularAgent.noticeHttpTransaction(url,method,status,startTime,endTime,bytesSent,bytesReceived,response);
  };


  consoleEvents = (message) => {
    NRMModularAgent.nativeLog(message);
  }

  startAgent = (appKey,agentVersion,reactNativeVersion,config) => {
    LOG.info('React Native agent started. 12245' + isTurboModuleEnabled);
    NRMModularAgent.startAgent(appKey,agentVersion,reactNativeVersion,config);
    NRMAModularAgentWrapper.isAgentStarted = true;
  }

  startInteraction = async (actionName) => {
    if(NRMAModularAgentWrapper.isAgentStarted) {
     return await  NRMModularAgent.startInteraction(actionName);
    }
  }
  
  endInteraction = (actionName) => {
    if(NRMAModularAgentWrapper.isAgentStarted) {
         NRMModularAgent.endInteraction(actionName);
    }
  }

  setInteractionName = (name) => {
    if(NRMAModularAgentWrapper.isAgentStarted) {
     NRMModularAgent.setInteractionName(name);
    }
  }

  shutdown = () => {
    if(NRMAModularAgentWrapper.isAgentStarted) {
      NRMModularAgent.shutdown();
      NRMAModularAgentWrapper.isAgentStarted = false;
    }
  }

  recordReplay = () => {
    if(NRMAModularAgentWrapper.isAgentStarted) {
      NRMModularAgent.recordReplay();
    }
  }

  pauseReplay = () => {
    if(NRMAModularAgentWrapper.isAgentStarted) {
      NRMModularAgent.pauseReplay();
    }
  }

  recordHandledException = async (error, JSAppVersion, isFatal) => {
  const parseErrorStack = require('react-native/Libraries/Core/Devtools/parseErrorStack');
  const symbolicateStackTrace = require('react-native/Libraries/Core/Devtools/symbolicateStackTrace');

  let parsedStack;
  let stack;

  const parseFunction = parseErrorStack.default || parseErrorStack;
  const symbolicateFunction = symbolicateStackTrace.default || symbolicateStackTrace;

  // Parse the error stack
  try {
    parsedStack = parseFunction(error.stack);
  } catch {
    // React Native <=0.63 takes an error instead of a string
    parsedStack = parseFunction(error);
  }

  // Symbolicate the stack trace
  try {
    const symbolicatedStack = await symbolicateFunction(parsedStack);
    stack = symbolicatedStack.stack;
  } catch (e) {
    // Unable to symbolicate stack in release mode
    stack = parsedStack;
  }

  const fileNameProperties = StackFrameEditor.parseFileNames(stack);
  const exceptionDictionary = {
    name: error.name,
    message: error.message,
    stackFrames: Object.assign({}, stack),
    isFatal: isFatal,
    JSAppVersion: JSAppVersion,
    ...fileNameProperties
  };
  NRMModularAgent.recordHandledException(exceptionDictionary);
  }

}

export default NRMAModularAgentWrapper;
