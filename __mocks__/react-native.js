import MOCK_NRM_MODULAR_AGENT from './nrm-modular-agent';

const mockedModule = jest.mock('react-native');

mockedModule.NativeModules = { NRMModularAgent: MOCK_NRM_MODULAR_AGENT };

module.exports = mockedModule;
