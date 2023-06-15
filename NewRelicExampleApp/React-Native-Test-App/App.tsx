/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import UtilsScreen from './screens/UtilsScreen';
import TestScreen from './screens/TestScreen';
import NewsFeedScreen from './screens/NewsFeedScreen';
import BrowserScreen from './screens/BrowserScreen';
import { RootStackParamList } from './Browser';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;


function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}


const Home = () => {
  return (
    <>
    <Tab.Navigator >
      <Tab.Screen
        name="Tests"
        component={TestScreen}
        options={
          {
            headerShown: false,
          }
        }
      />
      <Tab.Screen
        name="Utils"
        component={UtilsScreen}
        options={
          {
            headerShown: false,
          }
        }
      />
      <Tab.Screen
        name="News Feed"
        component={NewsFeedScreen}
        options={
          {
            headerShown: false,
          }
        }
      />
    </Tab.Navigator>
    </>
  );
};

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{title: 'New Relic Example App'}}
        />
        <Stack.Screen
          name="Browser"
          component={BrowserScreen}
          options={{title: 'Web View'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
