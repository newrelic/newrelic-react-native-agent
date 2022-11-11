import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';

import ApiScreen from './screens/Api';
import ExamplesScreen from './screens/Examples';

import NewRelic from 'newrelic-react-native-agent';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer onStateChange={ NewRelic.onStateChange } >
      <Tab.Navigator>
        <Tab.Screen 
          name="APIs"
          component={ApiScreen}
        />
        <Tab.Screen
          name="Examples"
          component={ExamplesScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;