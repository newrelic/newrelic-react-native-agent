'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  AccessibilityInfo
} from 'react-native';
import SearchPage from './pages/SearchPage';
import SearchResults from './pages/SearchResults';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


const Stack = createNativeStackNavigator();

export default class App extends Component<{}> {
  render() {
    return (

<NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={SearchPage}
          options={{ title: 'Welcome' }}
        />
        <Stack.Screen name="SearchResults" component={SearchResults} />
      </Stack.Navigator>
    </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});