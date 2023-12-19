import React, {useState} from 'react';
import {StyleSheet, Text, Button, Alert, View, Image} from 'react-native';
import newRelic from 'newrelic-react-native-agent';

const TestScreen = () => {
  const url = 'https://catfact.ninja/fact';
  const [facts, setFacts] = useState('');
  async function fetchFacts() {
    const interactionID = newRelic.startInteraction('catFactInteraction');
    const results = await fetch(url,{
      headers: {
        "Car": "Toyota",
      }
    });
    const response = await results.json();
    Alert.alert(response.fact);
    newRelic.endInteraction('catFactInteraction');
  }

  async function failedHTTPRequest() {
    await fetch(url + "/12345");
  }

  function createUnhandledPromise() {
    throw Promise.reject('Error');
  }

  return (
    <>
      <View style={styles.description}>
        <Text style={styles.text}>
          This is the React Native Example App. The Utils tab will show our API
          methods and how to call them. The News Feed tab will allow you to
          access the Web View and monitor HTTP network requests. Below are some
          examples of HTTP requests and interactions and error reporting.
        </Text>
        <Image source={{uri: "https://placekitten.com/200/300"}} style={{ width: 200, height: 300 }} />
        <Button title="HTTP Request (Cat Fact)" onPress={fetchFacts} />
        <Button title="HTTP Request Failure" onPress={failedHTTPRequest} />
        <Button
            title="Create Unhandled Promise Rejection"
            onPress={createUnhandledPromise}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  description: {
    flex: 1,
    flexDirection: "column",
    rowGap: 16,
    padding: 8,
    alignItems: "center"
  },
  text: {
    fontSize: 16,
  },
  navbar: {
    height: 50,
    width: '100%',
    flexDirection: 'row-reverse',
    paddingTop: 6,
    backgroundColor: '#fefefe',
    borderTopColor: 'grey',
    borderTopWidth: 1,
  },
  back: {
    width: 100,
    height: 100,
  },
  forward: {
    width: 100,
    height: 100,
  },
  urlText: {
    overflow: 'hidden',
    flex: 1,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
});

export default TestScreen;
