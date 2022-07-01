import MOCK_NRM_MODULAR_AGENT from './nrm-modular-agent';

const mockedModule = jest.mock(
    'react-native',
    () => {



     
      return {
        NativeModules: { 
            NRMModularAgent: MOCK_NRM_MODULAR_AGENT      
        },
        Platform: {
          OS: 'ios',
          constants: {
            reactNativeVersion:{
                'major':0,
                'minor':66,
                'patch':3
            }
          }
        },
      };
    },
    /* virtual allows us to mock modules that aren't in package.json */
    { virtual: true }
  );;

module.exports = mockedModule;
