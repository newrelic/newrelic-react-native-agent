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

});
