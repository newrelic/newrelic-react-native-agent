/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Karla_600SemiBold_Italic, useFonts} from '@expo-google-fonts/karla';

function App(): JSX.Element {
  const opacity = useSharedValue(1);

  // const [areFontsLoaded] = useFonts({Karla_600SemiBold_Italic});

  const test1Animated = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, {
      duration: 500,
    }),
  }));

  useEffect(() => {
    let prevValue = opacity.value;

    setInterval(() => {
      const nextValue = prevValue === 1 ? 0 : 1;
      opacity.value = nextValue;
      prevValue = nextValue;
    }, 500);
  }, [opacity]);

  // if (!areFontsLoaded) return null;

  return (
    <SafeAreaView>
      <Animated.Text style={[styles.test1, test1Animated]}>
        Testing Animation
      </Animated.Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  test1: {
    fontSize: 25,
    lineHeight: 30,
    textAlign: 'center',
    marginVertical: 50,
    // fontFamily: 'Karla_600SemiBold_Italic',
  },
});

export default App;
