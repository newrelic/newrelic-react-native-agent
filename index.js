import utils from './new-relic/nr-utils';
import {LOG} from './new-relic/nr-logger';
import {Platform} from 'react-native';
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
      didAddPromiseRejection:false,
      didOverrideConsole:false
    };
    this.LOG = LOG;
    this.NRMAModularAgentWrapper = new NRMAModularAgentWrapper();
    this.agentVersion = version;
  }

  /**
   * True if native agent is started. False if native agent is not started.
   * @returns {boolean}
   */
  isAgentStarted = () => NRMAModularAgentWrapper.isAgentStarted;

  /**
   * Start the agent
   */
   startAgent(appkey) {
    this.LOG.verbose = true; // todo: should let this get set by a param
    this.NRMAModularAgentWrapper.startAgent(appkey,this.agentVersion,this.getReactNativeVersion());
    this.addNewRelicErrorHandler();
    this.addNewRelicPromiseRejectionHandler();
    this._overrideConsole();
    //this.enableNetworkInteraction();
    this.LOG.info('React Native agent started.');
    this.LOG.info(`New Relic React Native agent version ${this.agentVersion}`);
    this.setAttribute('ReactNativeAgentVersion', this.agentVersion);
    this.setAttribute('JSEngine', global.HermesInternal ? "Hermes":"JavaScriptCore");


  }
  getReactNativeVersion() {
    var rnVersion =  Platform.constants.reactNativeVersion;
    return `${rnVersion.major}.${rnVersion.minor}.${rnVersion.patch}`
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
 * Track a method as an interaction
 */
  async startInteraction(actionName)  {
    if(utils.notEmptyString(actionName)) {
      return await this.NRMAModularAgentWrapper.startInteraction(actionName);  
    }  else {
      this.LOG.warn(`actionName is required`);
    }
  }

  /**
 * End an interaction
 * Required. The string ID for the interaction you want to end.
 * This string is returned when you use startInteraction().
 */

   endInteraction(interActionId) {
    if(utils.notEmptyString(interActionId)) {
      this.NRMAModularAgentWrapper.execute('endInteraction', interActionId);
    }  else {
      this.LOG.warn(`interActionId is Required`);
    }
  }


  /**
 * ANDROID ONLY
 * Name or rename an interaction
 */

  setInteractionName(name) {
    if(Platform.OS === 'android') {
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

  addNewRelicPromiseRejectionHandler () {

const prevTracker = getUnhandledPromiseRejectionTracker();

if(!this.state.didAddPromiseRejection) {
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
    if(!this.state.didOverrideConsole) {
    const defaultLog = console.log;
    const defaultWarn = console.warn;
    const defaultError = console.error;
    const self = this;

    console.log = function() {
      self.sendConsole('log', arguments);
      defaultLog.apply(console, arguments);
    };
    console.warn = function() {
      self.sendConsole('warn', arguments);
      defaultWarn.apply(console, arguments);
    };
    console.error = function() {
      self.sendConsole('error', arguments);
      defaultError.apply(console, arguments);
    };
    this.state.didOverrideConsole = true;
   }
  }

  sendConsole(type, args) {
    const argsStr = JSON.stringify(args);
    this.send('JSConsole', {consoleType: type, args: argsStr});
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


  // enableNetworkInteraction() {


  //  var network = {
  //     startTime: 0
  //   };
  

  // var NRMAModularAgentWrapper = this.NRMAModularAgentWrapper;  

	// var originalXhrOpen = XMLHttpRequest.prototype.open;
  // var originalXHRSend = XMLHttpRequest.prototype.send;

  //   XMLHttpRequest.prototype.open = function ( method, url) {
  //     // Keep track of the method and url
  //     // start time is tracked by the `send` method
      
  //     // eslint-disable-next-line prefer-rest-params
  //     return originalXhrOpen.apply(this, arguments)
      
  //   }
  
  //   XMLHttpRequest.prototype.send = function(data) {
     
      
  //     if (this.addEventListener) {
  //       this.addEventListener(
  //         'readystatechange',async () =>{
           
  //           if (this.readyState === this.HEADERS_RECEIVED) {
  //             const contentTypeString = this.getResponseHeader('Content-Type');
  //             if (contentTypeString) {            
  //             }
                
  //             if (this.getAllResponseHeaders()) {
  //               const responseHeaders = this.getAllResponseHeaders().split('\r\n');
  //               const responseHeadersDictionary = {};
  //               responseHeaders.forEach(element => {
  //                 const key = element.split(':')[0];
  //                 const value = element.split(':')[1];
  //                 responseHeadersDictionary[key] = value;
  //               });
  //             }
  //           }
  //           if (this.readyState === this.DONE) {
              
  //             if (this.response) {
  //               if (this.responseType === 'blob') {
  //                 var responseText =  await (new Response(this.response)).text();
  //               NRMAModularAgentWrapper.execute('noticeHttpTransaction',this.responseURL,this._method,this.status,network.startTime,Date.now(),byteSize(data),byteSize(responseText),responseText);

  //               } else if (this.responseType === 'text') {
  //               }
  //               NRMAModularAgentWrapper.execute('noticeHttpTransaction',this.responseURL,this._method,this.status,network.startTime,Date.now(),byteSize(data),byteSize(this.response),this.response);
  //             }

  //           }
  //         },
  //         false
  //       );
  
  //     }
  //     network.startTime = Date.now();
  //     originalXHRSend.apply(this, arguments);
  //   }

  // }


}
const byteSize = str => new Blob([str]).size;

const newRelic = new NewRelic();
export default newRelic;


