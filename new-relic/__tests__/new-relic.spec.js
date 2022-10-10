import { Platform } from 'react-native';
import NewRelic from '../../index';
import MockNRM from '../../__mocks__/nrm-modular-agent';
import NRMAModularAgentWrapper from '../nrma-modular-agent-wrapper';      

let testHandler = [];
let tracker =[];


global.ErrorUtils = {
  setGlobalHandler: nrHandler => testHandler.push(nrHandler),
  getGlobalHandler: error => error,
};




describe('New Relic', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    MockNRM.getReactNativeVersion = "0.66.3";
    // mock that the native agents are started
    NRMAModularAgentWrapper.isAgentStarted = true;
    NewRelic.state.didAddErrorHandler = false;
    NewRelic.state.didAddPromiseRejection = false;
    NewRelic.state.didOverrideConsole = false;
    NewRelic.LOG.verbose = false;
    testHandler = [];
  });

  it('should have sane default state', () => {
    expect(NewRelic.JSAppVersion).toBeFalsy();
    expect(NewRelic.state.didAddPromiseRejection).toBe(false);
    expect(NewRelic.state.didAddErrorHandler).toBe(false);
    expect(NewRelic.state.didOverrideConsole).toBe(false);

    expect(NewRelic.LOG.verbose).toBe(false);
  });

  it('should start and add our js error handler if the native agent isnt already running', () => {
    NRMAModularAgentWrapper.isAgentStarted = false;
    NewRelic.startAgent("12345");
    expect(NewRelic.state.didAddErrorHandler).toBe(true);
    expect(NewRelic.state.didAddPromiseRejection).toBe(true);
    expect(NewRelic.state.didOverrideConsole).toBe(true);
    expect(NewRelic.LOG.verbose).toBe(true);
    expect(testHandler.length).toBe(1);
  });

  it('should not call start multiple times if we are already running', () => {
    NewRelic.startAgent("12345");
    NewRelic.startAgent("12345");
    NewRelic.startAgent("12345");
    NewRelic.startAgent("12345");
    NewRelic.startAgent("12345");
    NewRelic.startAgent("12345");
    expect(NewRelic.state.didAddErrorHandler).toBe(true);
    expect(NewRelic.state.didAddPromiseRejection).toBe(true);
    expect(NewRelic.state.didOverrideConsole).toBe(true);

    expect(NewRelic.LOG.verbose).toBe(true);
    expect(testHandler.length).toBe(1);
    // native calls to the agent should not happen if we are already started
    expect(MockNRM.startAgent.mock.calls.length).toBe(6);
  });

  it('should set the analytics event flag', () => {
    NewRelic.analyticsEventEnabled(true);
    NewRelic.analyticsEventEnabled(false);
    expect(MockNRM.analyticsEventEnabled.mock.calls.length).toBe(2);
  });

  it('should set the network request flag', () => {
    NewRelic.networkRequestEnabled(true);
    NewRelic.networkRequestEnabled(false);
    expect(MockNRM.networkRequestEnabled.mock.calls.length).toBe(2);
  });

  it('should set the network error request flag', () => {
    NewRelic.networkErrorRequestEnabled(true);
    NewRelic.networkErrorRequestEnabled(false);
    expect(MockNRM.networkErrorRequestEnabled.mock.calls.length).toBe(2);
  });

  it('should set the network error request flag', () => {
    NewRelic.httpRequestBodyCaptureEnabled(true);
    NewRelic.httpRequestBodyCaptureEnabled(false);
    expect(MockNRM.httpRequestBodyCaptureEnabled.mock.calls.length).toBe(2);
  });

  it('should record a valid breadcrumb', () => {
    NewRelic.recordBreadcrumb('testName', { test: 123, valid: 'yes' });
    NewRelic.recordBreadcrumb(null, { test: 123, valid: 'no' });
    expect(MockNRM.recordBreadcrumb.mock.calls.length).toBe(1);
  });

  it('should not record a bad breadcrumb', () => {
    NewRelic.recordBreadcrumb(null, { test: 123, valid: 'no' });
    expect(MockNRM.recordBreadcrumb.mock.calls.length).toBe(0);
  });

  it('should not start InterAction', () => {
    NewRelic.startInteraction();
    expect(MockNRM.startInteraction.mock.calls.length).toBe(0);
  });

  it('should not End InterAction', () => {
    NewRelic.endInteraction();
    expect(MockNRM.endInteraction.mock.calls.length).toBe(0);
  });

  it('should record a valid Custom Event', () => {
    NewRelic.recordCustomEvent('eventType', 'eventName', { test: 123, valid: 'yes' });
    NewRelic.recordCustomEvent('eventType', '', { test: 123, valid: 'yes' });
    NewRelic.recordCustomEvent('eventType', undefined, { test: 123, valid: 'yes' });

    expect(MockNRM.recordCustomEvent.mock.calls.length).toBe(3);
  });

  it('should not record a bad Custom Event', () => {
    NewRelic.recordCustomEvent('eventType', null, { test: 123, valid: 'yes' });
    NewRelic.recordCustomEvent('eventType', [], { test: 123, valid: 'yes' });
    NewRelic.recordCustomEvent('eventType', {}, { test: 123, valid: 'yes' });
    expect(MockNRM.recordCustomEvent.mock.calls.length).toBe(0);
  });

  it('should crash on call with a valid message', () => {
    NewRelic.crashNow();
    expect(MockNRM.crashNow.mock.calls.length).toBe(1);

    NewRelic.crashNow('crash message');
    expect(MockNRM.crashNow.mock.calls.length).toBe(2);
  });

  it('should return the current session id', () => {
    NewRelic.currentSessionId();
    expect(MockNRM.currentSessionId.mock.calls.length).toBe(1);
  });

  it('should notice network failure with correct params', () => {
    NewRelic.noticeNetworkFailure("https://newrelic.com", "POST", Date.now(), Date.now(), 'Unknown');
    NewRelic.noticeNetworkFailure("https://newrelic.com", "POST", Date.now(), Date.now(), 'BadURL');
    NewRelic.noticeNetworkFailure("https://newrelic.com", "POST", Date.now(), Date.now(), 'CannotConnectToHost');
    NewRelic.noticeNetworkFailure("https://newrelic.com", "POST", Date.now(), Date.now(), 'DNSLookupFailed');
    NewRelic.noticeNetworkFailure("https://newrelic.com", "POST", Date.now(), Date.now(), 'BadServerResponse');
    NewRelic.noticeNetworkFailure("https://newrelic.com", "POST", Date.now(), Date.now(), 'SecureConnectionFailed');
    expect(MockNRM.noticeNetworkFailure.mock.calls.length).toBe(6);
  });

  it('should not notice network failure with bad failure name', () => {
    NewRelic.noticeNetworkFailure("https://newrelic.com", "GET", Date.now(), Date.now(), '404');
    NewRelic.noticeNetworkFailure("https://newrelic.com", "GET", Date.now(), Date.now(), 'randomname');
    expect(MockNRM.noticeNetworkFailure.mock.calls.length).toBe(0);
  });

  it('should record metric with correct params', () => {
    NewRelic.recordMetric('fakeName', 'fakeCategory');
    NewRelic.recordMetric('fakeName', 'fakeCategory', 13);
    NewRelic.recordMetric('fakeName', 'fakeCategory', 21, 'PERCENT', 'SECONDS');
    expect(MockNRM.recordMetric.mock.calls.length).toBe(3);
  });

  it('should not record metric with bad params', () => {
    NewRelic.recordMetric('fakeName', 'fakeCategory', 2, 'SECONDS');
    NewRelic.recordMetric('fakeName', 'fakeCategory', -1, 'SECONDS', 'PERCENT');
    NewRelic.recordMetric('fakeName', 'fakeCategory', 10, null, 'BYTES_PER_SECOND');
    NewRelic.recordMetric('fakeName', 'fakeCategory', 3, 'MINUTES', 'SECONDS');
    NewRelic.recordMetric('fakeName', 'fakeCategory', 3, 'PERCENT', 'HOURS');
    NewRelic.recordMetric('fakeName', 'fakeCategory', 3, 'DAYS', 'HOURS');
    expect(MockNRM.recordMetric.mock.calls.length).toBe(0);
  });

  it('should remove all attributes', () => {
    NewRelic.removeAllAttributes();
    expect(MockNRM.removeAllAttributes.mock.calls.length).toBe(1);
  });

  it('should record JS error with a given valid error', () => {
    NewRelic.setJSAppVersion('new version 123');
    
    NewRelic.recordError(new TypeError);
    NewRelic.recordError(new Error);
    NewRelic.recordError(new EvalError);
    NewRelic.recordError(new RangeError);
    NewRelic.recordError(new ReferenceError);
    NewRelic.recordError('fakeErrorName');

    expect(MockNRM.recordStack.mock.calls.length).toBe(6);
  });

  it('should not record JS error with a bad error', () => {
    NewRelic.setJSAppVersion('123');
    
    NewRelic.recordError(undefined);
    NewRelic.recordError(null);
    NewRelic.recordError(123);
    NewRelic.recordError(true);
    NewRelic.recordError('');

    expect(MockNRM.recordStack.mock.calls.length).toBe(0);
  });

  it('should set max event buffer time', () => {
    NewRelic.setMaxEventBufferTime(120);
    expect(MockNRM.setMaxEventBufferTime.mock.calls.length).toBe(1);
  });

  it('should set max event pool size', () => {
    NewRelic.setMaxEventPoolSize(2000);
    expect(MockNRM.setMaxEventPoolSize.mock.calls.length).toBe(1);
  });

  it('should set a valid Attribute', () => {
    NewRelic.setAttribute('eventType', 'eventName');
    NewRelic.setAttribute('eventType', 123);
    NewRelic.setAttribute('eventType', true);
    NewRelic.setAttribute('eventType', false);

    expect(MockNRM.setStringAttribute.mock.calls.length).toBe(1);
    expect(MockNRM.setNumberAttribute.mock.calls.length).toBe(1);
    expect(MockNRM.setBoolAttribute.mock.calls.length).toBe(2);
  });

  it('should not set bad attributes', () => {
    NewRelic.setAttribute(null, null);
    NewRelic.setAttribute(null, 'yes');
    NewRelic.setAttribute('yes', null);
    NewRelic.setAttribute(123, null);
    NewRelic.setAttribute(true, null);
    NewRelic.setAttribute('true', undefined);
    NewRelic.setAttribute('', undefined);

    expect(MockNRM.setStringAttribute.mock.calls.length).toBe(0);
    expect(MockNRM.setNumberAttribute.mock.calls.length).toBe(0);
    expect(MockNRM.setBoolAttribute.mock.calls.length).toBe(0);
  });

  it('should increment attributes', () => {
    NewRelic.incrementAttribute('eventType');
    expect(MockNRM.incrementAttribute.mock.calls.length).toBe(1);

    NewRelic.incrementAttribute('eventTypeWithValue', 100);
    expect(MockNRM.incrementAttribute.mock.calls.length).toBe(2);
  });

  it('should not increment attributes with bad values', () => {
    NewRelic.incrementAttribute(null, null);
    NewRelic.incrementAttribute(null, 2);
    NewRelic.incrementAttribute('yes', null);
    NewRelic.incrementAttribute('', undefined);
    NewRelic.incrementAttribute(null);
    NewRelic.incrementAttribute(undefined);
    NewRelic.incrementAttribute('bool', true);

    expect(MockNRM.incrementAttribute.mock.calls.length).toBe(0);
  });


  it('should set a valid js app version', () => {
    NewRelic.setJSAppVersion('new version 123');
    NewRelic.setJSAppVersion('12.12.12');

    expect(MockNRM.setJSAppVersion.mock.calls.length).toBe(2);
  });

  it('should not set a bad js app version', () => {
    NewRelic.setJSAppVersion(null);

    expect(MockNRM.setJSAppVersion.mock.calls.length).toBe(0);
  });

  it('should set a valid User Id', () => {
    NewRelic.setUserId('new version 123');
    NewRelic.setUserId('12.12.12');

    expect(MockNRM.setUserId.mock.calls.length).toBe(2);
  });

  it('should record to start method Interaction', () => {
    NewRelic.startInteraction('Start InterAction');

    expect(MockNRM.startInteraction.mock.calls.length).toBe(1);
  });

  it('should end method Interaction', () => {
    NewRelic.endInteraction('Start InterAction');

    expect(MockNRM.endInteraction.mock.calls.length).toBe(1);
  });

  it('should not set a bad User Id', () => {
    NewRelic.setUserId(null);
    NewRelic.setUserId(123);
    NewRelic.setUserId(true);
    NewRelic.setUserId([]);
    NewRelic.setUserId({});
    NewRelic.setUserId(undefined);

    expect(MockNRM.setUserId.mock.calls.length).toBe(0);
  });

  it('calling start multiple times should only add one new relic error handler', () => {
    NewRelic.startAgent();
    NewRelic.startAgent();
    NewRelic.startAgent();
    expect(testHandler.length).toBe(1);
  });

  it('should ignore calls if the agent is not started', () => {
    NRMAModularAgentWrapper.isAgentStarted = false;
    NewRelic.setJSAppVersion('new version 123');
    expect(MockNRM.setJSAppVersion.mock.calls.length).toBe(0);
  });

  it('should know if its running or not', () => {
    NRMAModularAgentWrapper.isAgentStarted = false;
    expect(NewRelic.isAgentStarted()).toBeFalsy();
    NRMAModularAgentWrapper.isAgentStarted = true;
    expect(NewRelic.isAgentStarted()).toBeTruthy();
  });

  it('sends console.log to record custom Events', () => {
    NewRelic.startAgent("12345");
    console.log('hello');
    expect(MockNRM.recordCustomEvent.mock.calls.length).toBe(12);
  });

  it('sends console.warn to record custom Events', () => {
    NewRelic.startAgent("12345");
    console.log('hello');
    console.warn('hello');
    console.error('hello');
    expect(MockNRM.recordCustomEvent.mock.calls.length).toBe(25);
  });

  it('sends breadcrumb for navigation if it is not first screen', () => {

    NewRelic.state.isFirstScreen = false;
    var event = {"initialProps":{"componentId":"Component4"},"rootTag":11};
    
    NewRelic.componentDidAppearListener(event);
    
    expect(MockNRM.recordBreadcrumb.mock.calls.length).toBe(1);
  });

  it('not sending breadcrumb for navigation if it is first screen', () => {

    NewRelic.state.isFirstScreen = false;
    var event = {"initialProps":{"componentId":"Component4"},"rootTag":11};
    
    NewRelic.componentDidAppearListener(event);
    
    expect(MockNRM.recordBreadcrumb.mock.calls.length).toBe(0);
  });

  it('sends breadcrumb from navigationStateChange Listener', () => {

    NewRelic.state.isFirstScreen = false;
    var newState = {"index": 1, "isTransitioning": false, "key": "StackRouterRoot", "routes": [{"key": "id-1660675098665-0", "routeName": "Home"}, {"key": "id-1660675098665-1", "params": [Object], "routeName": "Profile"}]};
    
    NewRelic.onNavigationStateChange('',newState,'');
    
    expect(MockNRM.recordBreadcrumb.mock.calls.length).toBe(1);
  });

  it('sends breadcrumb from statechange Listener', () => {

    NewRelic.state.isFirstScreen = false;
    var newState = {"index": 1, "key": "stack-YjJKdS9Cyw2S_9eqBwGy5", "routeNames": ["Home", "HttpDemo", "ErrorDemo", "CustomDataDemo"], "routes": [{"key": "Home-04bWmlOhC_9ZpO6vsNNai", "name": "Home", "params": undefined}, {"key": "HttpDemo-zQsn6TtkDwiNm4A4OSw32", "name": "HttpDemo", "params": [Object], "path": undefined}], "stale": false, "type": "stack"};
    
    NewRelic.onStateChange(newState);
    
    expect(MockNRM.recordBreadcrumb.mock.calls.length).toBe(1);
  });

});
