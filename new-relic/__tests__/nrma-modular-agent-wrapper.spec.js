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
    expect(MockNRM.setJSAppVersion.mock.calls.length).toBe(0);
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
