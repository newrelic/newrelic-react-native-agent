/**
 * Minimal SPM smoke-test screen.
 *
 * Each button exercises a different agent API; verify the resulting events
 * land in your NR1 mobile entity (Events, Errors, Crash analysis).
 */

import React from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import NewRelic from 'newrelic-react-native-agent';

function Row({title, onPress}: {title: string; onPress: () => void}) {
  return (
    <View style={styles.row}>
      <Button title={title} onPress={onPress} />
    </View>
  );
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000' : '#fff',
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={[styles.title, {color: isDarkMode ? '#fff' : '#000'}]}>
            New Relic SPM smoke test
          </Text>
          <Text style={[styles.subtitle, {color: isDarkMode ? '#aaa' : '#444'}]}>
            Tap each button, then verify the event in NR1.
          </Text>
        </View>

        <Row
          title="Record custom event"
          onPress={() =>
            NewRelic.recordCustomEvent('SPMSmokeTest', 'CustomEvent', {
              source: 'spm-example',
              ts: Date.now(),
            })
          }
        />

        <Row
          title="Record handled exception"
          onPress={() => {
            try {
              throw new Error('Handled error from SPM example');
            } catch (e) {
              NewRelic.recordHandledException(e as Error);
            }
          }}
        />

        <Row
          title="Throw unhandled JS error"
          onPress={() => {
            throw new Error('Unhandled JS error from SPM example');
          }}
        />

        <Row
          title="Record breadcrumb"
          onPress={() =>
            NewRelic.recordBreadcrumb('user-tapped-spm-button', {
              screen: 'home',
            })
          }
        />

        <Row
          title="Start / end interaction"
          onPress={async () => {
            const id = await NewRelic.startInteraction('SPMInteraction');
            setTimeout(() => NewRelic.endInteraction(id), 250);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16},
  title: {fontSize: 22, fontWeight: '600'},
  subtitle: {fontSize: 14, marginTop: 6},
  row: {paddingHorizontal: 24, paddingVertical: 8},
});

export default App;
