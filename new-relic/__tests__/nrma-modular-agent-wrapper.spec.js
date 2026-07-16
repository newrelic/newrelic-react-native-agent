/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

import { NativeModules } from 'react-native';
import NRMAModularAgentWrapper from '../nrma-modular-agent-wrapper';
import MockNRM from '../../__mocks__/nrm-modular-agent';

let test = null;

describe('nrmaModularAgentWrapper', () => {
  beforeEach(() => {
    NRMAModularAgentWrapper.isAgentStarted = true;
    test = new NRMAModularAgentWrapper();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should execute commands if the agent is started', () => {
    test.execute('setJSAppVersion', '123');
    expect(MockNRM.setJSAppVersion.mock.calls.length).toBe(1);
  });

  it('should not execute commands if the agent is not started', () => {
    NRMAModularAgentWrapper.isAgentStarted = false;
    test.execute('setJSAppVersion', '123');
    test.execute('consoleEvents','hello');
    expect(MockNRM.setJSAppVersion.mock.calls.length).toBe(0);
    expect(MockNRM.consoleEvents.mock.calls.length).toBe(0);


  });

  it('should not execute InterAction commands if the agent is not started', () => {
    NRMAModularAgentWrapper.isAgentStarted = false;
    test.execute('startInteraction', '123');
    test.execute('endInteraction','hello');
    test.execute('setInteractionName','hello');

    expect(MockNRM.startInteraction.mock.calls.length).toBe(0);
    expect(MockNRM.endInteraction.mock.calls.length).toBe(0);
    expect(MockNRM.setInteractionName.mock.calls.length).toBe(0);
  });


  it('should execute InterAction commands if the agent is started', () => {
    NRMAModularAgentWrapper.isAgentStarted = true;
    test.execute('startInteraction', '123');
    test.execute('endInteraction','hello');
    test.execute('setInteractionName','hello');

    expect(MockNRM.startInteraction.mock.calls.length).toBe(1);
    expect(MockNRM.endInteraction.mock.calls.length).toBe(1);
    expect(MockNRM.setInteractionName.mock.calls.length).toBe(1);
  });




  it('should ignore commands that are not commands', () => {
    expect(test.hasMethod('badTest')).toBe(false);
    expect(test.hasMethod('protoType')).toBe(false);
    expect(test.hasMethod('call')).toBe(false);
    expect(test.hasMethod('apply')).toBe(false);
    expect(test.hasMethod('foo')).toBe(false);
    expect(test.hasMethod('setJSAppVersion')).toBe(true);
  });

  it('should execute recordError when agent is started', () => {
    NRMAModularAgentWrapper.isAgentStarted = true;
    test.execute('recordError', 'TestError', 'Test message', 'stack trace', false, {});
    expect(MockNRM.recordError.mock.calls.length).toBe(1);
    expect(MockNRM.recordError.mock.calls[0][0]).toBe('TestError');
    expect(MockNRM.recordError.mock.calls[0][1]).toBe('Test message');
    expect(MockNRM.recordError.mock.calls[0][2]).toBe('stack trace');
    expect(MockNRM.recordError.mock.calls[0][3]).toBe(false);
  });

  it('should not execute recordError when agent is not started', () => {
    NRMAModularAgentWrapper.isAgentStarted = false;
    test.execute('recordError', 'TestError', 'Test message', 'stack trace', false, {});
    expect(MockNRM.recordError.mock.calls.length).toBe(0);
  });

  it('should handle null values in recordError with defaults', () => {
    NRMAModularAgentWrapper.isAgentStarted = true;
    test.execute('recordError', null, null, null, true, {});
    expect(MockNRM.recordError.mock.calls.length).toBe(1);
    expect(MockNRM.recordError.mock.calls[0][0]).toBe('Error');
    expect(MockNRM.recordError.mock.calls[0][1]).toBe('');
    expect(MockNRM.recordError.mock.calls[0][2]).toBe('');
    expect(MockNRM.recordError.mock.calls[0][3]).toBe(true);
  });

  it('should pass attributes to recordError', () => {
    NRMAModularAgentWrapper.isAgentStarted = true;
    const attributes = { customKey: 'customValue' };
    test.execute('recordError', 'Error', 'message', 'stack', false, attributes);
    expect(MockNRM.recordError.mock.calls.length).toBe(1);
    expect(MockNRM.recordError.mock.calls[0][4]).toEqual(attributes);
  });
});
