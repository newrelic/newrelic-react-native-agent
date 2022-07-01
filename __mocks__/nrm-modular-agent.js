export default  {
  startAgent: jest.fn(),
  recordBreadcrumb: jest.fn(),
  recordCustomEvent: jest.fn(),
  setStringAttribute: jest.fn(),
  setNumberAttribute: jest.fn(),
  setBoolAttribute: jest.fn(),
  setJSAppVersion: jest.fn(),
  setUserId: jest.fn(),
  recordStack: jest.fn(),
  startInteraction: jest.fn(),
  endInteraction:jest.fn(),
  setInteractionName:jest.fn(),
  consoleEvents:jest.fn(),
  getReactNativeVersion:jest.fn(),

  isAgentStarted: (name, callback) => {
    callback(true);
  },
};
