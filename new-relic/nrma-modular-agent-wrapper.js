import { NativeModules } from 'react-native';
import utils from './nr-utils';
import { LOG } from './nr-logger';
import { Attribute, BreadCrumb, NewRelicEvent } from './models';

const { NRMModularAgent } = NativeModules;

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

    return NRMModularAgent.isAgentStarted(name, (error, isRunning) => {
      this.didCheck = true;
      if (isRunning) {
        NRMAModularAgentWrapper.isAgentStarted = isRunning;
        return this.hasMethod(name) && this[name](...[].slice.call(args, 1));
      }
      return LOG.error(agentFailedToStartMsg);
    });
  }

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
      }
    });
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

  setJSAppVersion = (version) => {
    NRMModularAgent.setJSAppVersion(version);
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

  startAgent = (appKey,agentVersion,reactNativeVersion) => {
    NRMModularAgent.startAgent(appKey,agentVersion,reactNativeVersion);
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

}


export default NRMAModularAgentWrapper;
