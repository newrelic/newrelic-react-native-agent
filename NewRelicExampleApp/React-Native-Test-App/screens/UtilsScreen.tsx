import NewRelic from 'newrelic-react-native-agent';
import React, {useState} from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

let myMap = new Map<string, any>([
  ['key1', 'value1'],
  ['key2', 12345],
  ['key3', false],
]);

const UtilsScreen = () => {
  const [eventName, setEventName] = useState('testCustomEvent');
  const [analyticsEvent, setAnalyticsEvent] = useState(true);
  const [networkRequest, setNetworkRequest] = useState(true);
  const [networkErrorRequest, setNetworkErrorRequest] = useState(true);
  const [httpResponseBodyCapture, setHttpResponseBodyCapture] = useState(true);

  function setAttribute() {
    NewRelic.setAttribute('UtilsScreenAttribute1', 123);
    NewRelic.setAttribute('UtilsScreenAttribute2', 'testString');
    NewRelic.setAttribute('UtilsScreenAttribute3', false);
  }

  function removeAttribute() {
    NewRelic.removeAttribute('UtilsScreen');
  }

  function incrementAttribute() {
    NewRelic.incrementAttribute('UtilsScreenAttribute');
  }

  function setUserId() {
    NewRelic.setUserId('UtilsScreenV2');
  }

  function recordBreadcrumb() {
    NewRelic.recordBreadcrumb('Test Breadcrumb', myMap);
  }

  function recordCustomEvent() {
    NewRelic.recordCustomEvent('Test Type', eventName, myMap);
  }

  function crashNow() {
    NewRelic.crashNow('New Relic example crash message');
  }

  function recordError() {
    try {
      var foo = {};
      foo.bar();
    } catch (e) {
      NewRelic.recordError(e);
    }
  }

  async function currentSessionId() {
    const sessionId = await NewRelic.currentSessionId();
    Alert.alert('Your Session Id is: ' + sessionId);
  }

  function recordMetric() {
    NewRelic.recordMetric(
      'My Metrics',
      'NRMetrics',
      Math.floor(Math.random() * (11 - 0) + 0),
    );
  }

  function removeAllAttributes() {
    NewRelic.removeAllAttributes();
  }

  function noticeHTTPTransaction() {
    NewRelic.noticeHttpTransaction(
      'https://github.com',
      'GET',
      200,
      Date.now(),
      Date.now() + 1000,
      100,
      101,
      'Notice HTTP',
    );
  }

  function noticeNetworkFailure() {
    NewRelic.noticeNetworkFailure(
      'https://github.com',
      'GET',
      Date.now(),
      Date.now(),
      NewRelic.NetworkFailure.BadURL,
    );
  }

  function setMaxEventBuffer() {
    NewRelic.setMaxEventBufferTime(60);
  }

  function setMaxEventPool() {
    NewRelic.setMaxEventPoolSize(2000);
  }

  function analyticsEventEnabled() {
    const newValue = !analyticsEvent;
    setAnalyticsEvent(newValue);
    NewRelic.analyticsEventEnabled(newValue);
  }

  function networkRequestEnabled() {
    const newValue = !networkRequest;
    setNetworkRequest(newValue);
    NewRelic.networkRequestEnabled(newValue);
  }

  function networkErrorRequestEnabled() {
    const newValue = !networkErrorRequest;
    setNetworkErrorRequest(newValue);
    NewRelic.networkErrorRequestEnabled(newValue);
  }

  function httpResponseBodyCaptureEnabled() {
    const newValue = !httpResponseBodyCapture;
    setHttpResponseBodyCapture(newValue);
    NewRelic.httpResponseBodyCaptureEnabled(newValue);
  }

  function shutdown() {
    NewRelic.shutdown();
  }

  return (
    <>
      <ScrollView>
        <View style={styles.viewContainer}>
          <Pressable
            onPress={setAttribute}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Set Attribute</Text>
          </Pressable>
          <Pressable
            onPress={removeAttribute}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>removeAttribute</Text>
          </Pressable>
          <Pressable
            onPress={incrementAttribute}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Increment Attribute</Text>
          </Pressable>
          <Pressable
            onPress={removeAllAttributes}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Remove All Attributes</Text>
          </Pressable>
          <Pressable
            onPress={setUserId}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Set UserId</Text>
          </Pressable>
          <Pressable
            onPress={recordBreadcrumb}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Record Breadcrumb</Text>
          </Pressable>
          <TextInput
            placeholder="Enter Custom Event Name"
            onChangeText={name => setEventName(name)}
            textAlign="center"
            style={styles.inputText}
          />
          <Pressable
            onPress={recordCustomEvent}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Record Custom Event</Text>
          </Pressable>
          <Pressable
            onPress={crashNow}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Crash Now</Text>
          </Pressable>
          <Pressable
            onPress={recordError}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Record Error</Text>
          </Pressable>
          <Pressable
            onPress={currentSessionId}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Current Session Id</Text>
          </Pressable>
          <Pressable
            onPress={recordMetric}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Record Metric</Text>
          </Pressable>
          <Pressable
            onPress={noticeHTTPTransaction}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Notice HTTP Transaction</Text>
          </Pressable>
          <Pressable
            onPress={noticeNetworkFailure}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Notice Network Failure</Text>
          </Pressable>
          <Pressable
            onPress={setMaxEventBuffer}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>
              Set Max Event Buffer Time (60s)
            </Text>
          </Pressable>
          <Pressable
            onPress={setMaxEventPool}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>
              Set Max Event Pool Size (2000 events)
            </Text>
          </Pressable>
          <Pressable
            onPress={analyticsEventEnabled}
            style={() => [
              {backgroundColor: analyticsEvent ? '#0096FF' : '#E5E4E2'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Analytics Event Enabled</Text>
          </Pressable>
          <Pressable
            onPress={networkRequestEnabled}
            style={() => [
              {backgroundColor: networkRequest ? '#0096FF' : '#E5E4E2'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Network Request Enabled</Text>
          </Pressable>
          <Pressable
            onPress={networkErrorRequestEnabled}
            style={() => [
              {backgroundColor: networkErrorRequest ? '#0096FF' : '#E5E4E2'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Network Error Request Enabled</Text>
          </Pressable>
          <Pressable
            onPress={httpResponseBodyCaptureEnabled}
            style={() => [
              {
                backgroundColor: httpResponseBodyCapture
                  ? '#0096FF'
                  : '#E5E4E2'
              },
              styles.button,
            ]}>
            <Text style={styles.buttonText}>
              Http Response Body Capture Enabled
            </Text>
          </Pressable>
          <Pressable
            onPress={shutdown}
            style={({pressed}) => [
              {backgroundColor: pressed ? '#E5E4E2' : '#0096FF'},
              styles.button,
            ]}>
            <Text style={styles.buttonText}>Shutdown</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  viewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  inputText: {
    minWidth: '80%',
    borderWidth: 1,
    padding: 4,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default UtilsScreen;
