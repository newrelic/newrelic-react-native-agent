import React, {useState} from 'react';
import NewRelic from 'newrelic-react-native-agent';
import {Card} from '@rneui/themed';
import {ScrollView, View, Button, Switch, Text, StyleSheet} from 'react-native';

const ApiScreen = () => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [networkFlagEnabled, setNetworkFlagEnabled] = useState(true);
  const [networkErrorFlagEnabled, setNetworkErrorFlagEnabled] = useState(true);
  const [httpBodyFlagEnabled, setHttpBodyFlagEnabled] = useState(true);
  const analyticsHandler = () => {
    // State doesn't update immediately
    setAnalyticsEnabled(previousState => !previousState);
    //alert(!analyticsEnabled);
    NewRelic.analyticsEventEnabled(!analyticsEnabled);
  };
  const networkRequestHandler = () => {
    setNetworkFlagEnabled(previousState => !previousState);
    // alert(!networkFlagEnabled);
    NewRelic.networkRequestEnabled(!networkFlagEnabled);
  };
  const networkErrorRequestHandler = () => {
    setNetworkErrorFlagEnabled(previousState => !previousState);
    // alert(!networkErrorFlagEnabled);
    NewRelic.networkErrorRequestEnabled(!networkErrorFlagEnabled);
  };
  const httpBodyHandler = () => {
    setHttpBodyFlagEnabled(previousState => !previousState);
    // alert(!httpBodyFlagEnabled);
    NewRelic.httpRequestBodyCaptureEnabled(!httpBodyFlagEnabled);
  };

  const breadcrumbHandler = () => {
    NewRelic.recordBreadcrumb('breadEvent', {breadAttr: 'fakeBread'});
  };
  const metricHandler = () => {
    NewRelic.recordMetric('fakeMetricName', 'fakeMetricCategory');
    NewRelic.recordMetric(
      'fakeMetricNameWithVal',
      'fakeMetricCategoryWithVal',
      10,
    );
    NewRelic.recordMetric(
      'fakeMetricNameWithUnit',
      'fakeMetricCategoryWithUnit',
      15,
      'SECONDS',
      'OPERATIONS',
    );
  };
  const networkFailureHandler = () => {
    NewRelic.noticeNetworkFailure(
      'https://fakewebsite.com',
      'GET',
      Date.now(),
      Date.now(),
      'BadURL',
    );
  };
  const errorHandler = () => {
    try {
      var foo = {};
      foo.bar();
    } catch (e) {
      NewRelic.recordError(e);
    }
  };

  const crashHandler = () => {
    NewRelic.crashNow();
  };
  const sessionIdHandler = async () => {
    let sessionId = await NewRelic.currentSessionId();
    alert(sessionId);
  };
  const userIdHandler = () => {
    NewRelic.setUserId('fakeUserId');
  };
  const jsVersionHandler = () => {
    NewRelic.setJSAppVersion('FAKEVERSIONSTRING');
  };
  const consoleLogHandler = () => {
    console.log('this is a test console log');
  };

  const setAttrHandler = () => {
    NewRelic.setAttribute('setFakeAttr', 'yes');
  };
  const removeAttrHandler = () => {
    NewRelic.removeAttribute('setFakeAttr');
  };
  const removeAllAttrHandler = () => {
    NewRelic.removeAllAttributes();
  };
  const incrAttrHandler = () => {
    NewRelic.incrementAttribute('incrementAttribute');
    NewRelic.incrementAttribute('incrementAttributeWithVal', 7);
  };

  const bufferTimeHandler = () => {
    NewRelic.setMaxEventBufferTime(65);
  };
  const poolSizeHandler = () => {
    NewRelic.setMaxEventPoolSize(1250);
  };
  const customEventHandler = () => {
    NewRelic.recordCustomEvent('fakeEventType', 'fakeEventName', {
      fakeEventStr: 'value',
      fakeEventNum: 6,
      fakeEventBool: false,
    });
  };
  const customEventMultipleHandler = () => {
    for (var i = 0; i < 3000; i++) {
      NewRelic.recordCustomEvent('multipleEventType', 'multipleEventName', {
        val: i,
      });
    }
  };


  return (
    <ScrollView>
      <View>
        <Card>
          <Card.Title>Feature Flags</Card.Title>
          <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
            <Text>Analytics</Text>
            <Switch onValueChange={analyticsHandler} value={analyticsEnabled} />
            <Text>Network Requests</Text>
            <Switch
              onValueChange={networkRequestHandler}
              value={networkFlagEnabled}
            />
            <Text>Network Error Requests</Text>
            <Switch
              onValueChange={networkErrorRequestHandler}
              value={networkErrorFlagEnabled}
            />
            <Text>Http Request Body </Text>
            <Switch
              onValueChange={httpBodyHandler}
              value={httpBodyFlagEnabled}
            />
          </View>
        </Card>
        <Card>
          <Card.Title>Recording</Card.Title>
          <View style={styles.wrap}>
            <Button title="breadcrumb" onPress={breadcrumbHandler} />
            <Button title="metrics" onPress={metricHandler} />
            <Button title="network failure" onPress={networkFailureHandler} />
            <Button title="error" onPress={errorHandler} />
          </View>
        </Card>
        <Card>
          <Card.Title>Self</Card.Title>
          <View style={styles.wrap}>
            <Button title="crash now" onPress={crashHandler} />
            <Button title="session id" onPress={sessionIdHandler} />
            <Button title="set userId" onPress={userIdHandler} />
            <Button title="set JSAppVersion" onPress={jsVersionHandler} />
            <Button title="console log" onPress={consoleLogHandler} />
          </View>
        </Card>
        <Card>
          <Card.Title>Attributes</Card.Title>
          <View style={styles.wrap}>
            <Button title="set attribute" onPress={setAttrHandler} />
            <Button title="remove attribute" onPress={removeAttrHandler} />
            <Button
              title="remove all attributes"
              onPress={removeAllAttrHandler}
            />
            <Button title="increment attribute" onPress={incrAttrHandler} />
          </View>
        </Card>
        <Card>
          <Card.Title>Events</Card.Title>
          <View style={styles.wrap}>
            <Button title="maxBufferTime" onPress={bufferTimeHandler} />
            <Button title="maxPoolSize" onPress={poolSizeHandler} />
            <Button title="custom event" onPress={customEventHandler} />
            <Button
              title="many custom events"
              onPress={customEventMultipleHandler}
            />
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

export default ApiScreen;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  padding: {
    paddingRight: 10,
  },
});