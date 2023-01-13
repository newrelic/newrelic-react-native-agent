import React from 'react';
import {Card} from '@rneui/themed';
import {View, Button, Text, StyleSheet} from 'react-native';

import NewRelic from 'newrelic-react-native-agent';

const ExamplesScreen = () => {
  //Http Error and InterAction Example
  const badApiLoad = async () => {
    const interactionId = await NewRelic.startInteraction(
      'StartLoadBadApiCall',
    );
    console.log(interactionId);
    const url = 'https://facebook.github.io/react-native/moviessssssssss.json';
    fetch(url)
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson);
        NewRelic.endInteraction(interactionId);
      })
      .catch(error => {
        NewRelic.endInteraction(interactionId);
        console.error(error);
      });
  };

  // Http Request and Interaction Example
  const goodApiLoad = async () => {
    const interactionId = await NewRelic.startInteraction(
      'StartLoadGoodApiCall',
    );
    console.log(interactionId);
    const url = 'https://facebook.github.io/react-native/movies.json';

    NewRelic.recordBreadcrumb('Http Request Start', {
      url: url,
      starttine: new Date(),
    });
    fetch(url)
      .then(response => response.json())
      .then(responseJson => {
        NewRelic.recordBreadcrumb('Http Request Success', {
          response: responseJson,
          url: url,
          endtime: new Date(),
        });
        console.log(responseJson);
        NewRelic.endInteraction(interactionId);
      })
      .catch(error => {
        NewRelic.endInteraction(interactionId);
        console.error(error);
      });
  };

  //Promise Rejection Example
  // if user is not handling error in catch then it captures by our prmose rejection handler
  const promiseRejection = async () => {
    const interactionId = await NewRelic.startInteraction(
      'PromiseRejectionCall',
    );
    console.log(interactionId);
    const url = 'https://facebook.github.io/react-native/moviessssssssss.json';
    fetch(url)
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson);
        NewRelic.endInteraction(interactionId);
      });
  };

  // JS Error Example
  // When Javascript throws error it captures by our Error Handler
  const throwError = () => {
    throw new Error('I am Error');
  };

  return (
    <View>
      <Card>
        <Card.Title>Interactions</Card.Title>
        <Button title={'Bad API'} onPress={badApiLoad} color={'#3365f3'} />
        <Button title={'Good API'} onPress={goodApiLoad} color={'#3365f3'} />
        <Button
          title={'Promise Rejection Example'}
          onPress={promiseRejection}
          color={'#3365f3'}
        />
      </Card>
      <Card>
        <Card.Title>Thrown Errors</Card.Title>
        <Button
          title={'Error Example'}
          onPress={throwError}
          color={'#3365f3'}
        />
      </Card>
    </View>
  );
};

export default ExamplesScreen;

const styles = StyleSheet.create({
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
