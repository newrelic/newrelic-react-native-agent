
const mockedModule = jest.mock('react-native-promise-rejection-utils');

mockedModule.getUnhandledPromiseRejectionTracker = jest.fn();

mockedModule.setUnhandledPromiseRejectionTracker = jest.fn();

module.exports = mockedModule;