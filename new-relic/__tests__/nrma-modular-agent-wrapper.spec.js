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
});
