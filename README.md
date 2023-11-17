[![Community Plus header](https://github.com/newrelic/opensource-website/raw/main/src/images/categories/Community_Plus.png)](https://opensource.newrelic.com/oss-category/#community-plus)

[![npm](https://img.shields.io/npm/v/newrelic-react-native-agent?color=blue)](https://www.npmjs.com/package/newrelic-react-native-agent)
[![codecov](https://codecov.io/github/newrelic/newrelic-react-native-agent/branch/main/graph/badge.svg?token=J597PET0X4)](https://codecov.io/github/newrelic/newrelic-react-native-agent)

# New Relic React Native Agent

This agent uses native New Relic Android and iOS agents to instrument the React-Native Javascript environment. The New Relic SDKs collect crashes, network traffic, and other information for hybrid apps using native components.


## Features
* Capture JavaScript errors
* Network Instrumentation
* Distributed Tracing 
* Tracking console log, warn and error
* Promise rejection tracking
* Capture interactions and the sequence in which they were created
* Pass user information to New Relic to track user sessions
* Expo Support (Bare Workflow & Managed Workflow)

## Current Support:
- Android API 24+
- iOS 10
- Depends on New Relic iOS/XCFramework and Android agents

Native support levels are based on [React Native requirements](https://github.com/facebook/react-native#-requirements).

## Requirements
- React Native >= 0.61
- [IOS native requirements](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-ios/get-started/new-relic-ios-compatibility-requirements)
- [Android native requirements](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/get-started/new-relic-android-compatibility-requirements)

## Installation
Yarn
```sh
yarn add newrelic-react-native-agent
```
NPM
```sh
npm i newrelic-react-native-agent
```


## React Native Setup

Now open your `index.js` and add the following code to launch NewRelic (don't forget to put proper application tokens):

```js
import NewRelic from 'newrelic-react-native-agent';
import * as appVersion from './package.json';
import {Platform} from 'react-native';

    let appToken;

    if (Platform.OS === 'ios') {
        appToken = '<IOS-APP-TOKEN>';
    } else {
        appToken = '<ANDROID-APP-TOKEN>';
    }


 const agentConfiguration = {
    
    //Android Specific
    // Optional:Enable or disable collection of event data.
    analyticsEventEnabled: true,
    
    //Android Specific
    // Optional:Enable or disable collection of native c/c++ crash.
    nativeCrashReportingEnabled: true,

    // Optional:Enable or disable crash reporting.
    crashReportingEnabled: true,

    // Optional:Enable or disable interaction tracing. Trace instrumentation still occurs, but no traces are harvested. This will disable default and custom interactions.
    interactionTracingEnabled: true,

    // Optional:Enable or disable reporting successful HTTP requests to the MobileRequest event type.
    networkRequestEnabled: true,

    // Optional:Enable or disable reporting network and HTTP request errors to the MobileRequestError event type.
    networkErrorRequestEnabled: true,

    // Optional:Enable or disable capture of HTTP response bodies for HTTP error traces, and MobileRequestError events.
    httpResponseBodyCaptureEnabled: true,

    // Optional:Enable or disable agent logging.
    loggingEnabled: true,

    // Optional:Specifies the log level. Omit this field for the default log level.
    // Options include: ERROR (least verbose), WARNING, INFO, VERBOSE, AUDIT (most verbose).
    logLevel: NewRelic.LogLevel.INFO,

    // iOS Specific
    // Optional:Enable/Disable automatic instrumentation of WebViews
    webViewInstrumentation: true,

    // Optional:Set a specific collector address for sending data. Omit this field for default address.
    //collectorAddress: "",

    // Optional:Set a specific crash collector address for sending crashes. Omit this field for default address.
    //crashCollectorAddress: "",

    // Optional:Enable or disable reporting data using different endpoints for US government clients.
    //fedRampEnabled: false
  };


NewRelic.startAgent(appToken,agentConfiguration);
NewRelic.setJSAppVersion(appVersion.version);
AppRegistry.registerComponent(appName, () => App);

```
AppToken is platform-specific. You need to generate the seprate token for Android and iOS apps.

### Android Setup
1. Install the New Relic native Android agent ([instructions here](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/install-configure/install-android-apps-gradle-android-studio)).
2. Update `build.gradle`:
  ```groovy
    buildscript {
      ...
      repositories {
        ...
        mavenCentral()
      }
      dependencies {
        ...
        classpath "com.newrelic.agent.android:agent-gradle-plugin:7.1.0"
      }
    }
  ```

3. Update `app/build.gradle`:
```groovy
plugins {
  id 'newrelic'
}  
```
For legacy plugin application:
```groovy
apply plugin: 'newrelic'
```

4. Make sure your app requests INTERNET and ACCESS_NETWORK_STATE permissions by adding these lines to your `AndroidManifest.xml`
  ```
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  ```

### iOS Setup

Run the following, and it will install the New Relic XCFramework agent:
```shell
  npx pod-install
```

### AutoLinking and rebuilding

 - Once the above steps have been completed, the React Native NewRelic library must be linked to your project and your application needs to be rebuilt.
If you use React Native 0.60+, you automatically have access to "autolinking," requiring no further manual installation steps.

To automatically link the package, rebuild your project:
```shell
# Android apps
npx react-native run-android

# iOS apps
cd ios/
pod install --repo-update
cd ..
npx react-native run-ios
```

If you run following commands then Fatal JS erros will show up as a crash in NR.

```shell

npx react-native run-ios --configuration Release

npx react-native run-android --variant=release

```

### Expo

Integration with Expo is possible in both bare workflow and [custom managed workflow](https://docs.expo.io/workflow/customizing/) via [config plugins](https://docs.expo.io/guides/config-plugins/).

* [Bare Workflow](https://docs.expo.dev/introduction/managed-vs-bare/#bare-workflow): 
  * Please follow the above installation steps instead.
* [Managed Workflow](https://docs.expo.dev/introduction/managed-vs-bare/#bare-workflow): 
  * Install our package by running `npx expo install newrelic-react-native-agent`. You should see the plugin in `app.json` or `app.config.js`:
   ```js
    {
      "name": "my app",
      "plugins": ["newrelic-react-native-agent"]
    }
    ```
  * Update `index.js` with the configurations steps above. 
  * After this, you need to use the `expo prebuild --clean` command as described in the  ["Adding custom native code"](https://docs.expo.dev/workflow/customizing/) guide to rebuild your app with the plugin changes. If this command is not running, you'll get errors when starting the New Relic agent.
  * For Expo Go users, the agent will require using native code. Since Expo Go does not suport sending custom native code over-the-air, you can follow Expo's documentation on how to use ["Custom native code in Expo Go"](https://docs.expo.dev/bare/using-expo-client/).

## Routing Instrumentation

We currently provide two routing instrumentations out of the box to instrument route changes for and route changes record as Breadcrumb.

* [React Navigation](https://github.com/react-navigation/react-navigation)
* [React Native Navigation](https://github.com/wix/react-native-navigation)

*  **[react-navigation](https://github.com/react-navigation/react-navigation)**

	  *  **v5**
		set the `onStateChange` to `NewRelic.onStateChange` in your NavigationContainer as follows:

			```javascript
			<NavigationContainer
			onStateChange={  NewRelic.onStateChange  }  />
			```

	 *  **<=v4**
		set the `onNavigationStateChange` to `NewRelic.onNavigationStateChange` in your App wrapper as follows:

		```javascript
		export  default () => (
		<App
		onNavigationStateChange={ NewRelic.onNavigationStateChange  }  />
		);
		```

  *  **[react-native-navigation](https://github.com/wix/react-native-navigation)**

		Register `NewRelic.componentDidAppearListener` listener using:
		```javascript
		Navigation.events().registerComponentDidAppearListener( NewRelic.componentDidAppearListener );
		```
		
Alternatively, you can report your screen changes manually using the following API:


  ```js
   var params = {
      'screenName':'screenName'
    };
    
    NewRelic.recordBreadcrumb('navigation',params);
  
  ```

## Usage
See the examples below, and for more detail, see [New Relic IOS SDK doc](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-ios/ios-sdk-api) or [Android SDK](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api).

### [startInteraction](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/start-interaction)(interactionName: string): Promise&lt;InteractionId&gt;;
> Track a method as an interaction.

`InteractionId` is string.

### [setInteractionName](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/set-interaction-name)(interactionName: string): void;
> Name or rename interaction (Android-specific).

### [endInteraction](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/end-interaction)(id: InteractionId): void;
> End an interaction
> (Required). This uses the string ID for the interaction you want to end.
> This string is returned when you use startInteraction().

  ```js
   const badApiLoad = async () => {
     const interactionId = await NewRelic.startInteraction('StartLoadBadApiCall');
     console.log(interactionId);
     const url = 'https://facebook.github.io/react-native/moviessssssssss.json';
     fetch(url)
       .then((response) => response.json())
       .then((responseJson) => {
         console.log(responseJson);
         NewRelic.endInteraction(interactionId);
       }) .catch((error) => {
         NewRelic.endInteraction(interactionId);
         console.error(error);
       });;
   };
  
  ```

### [setAttribute](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/set-attribute)(name: string, value: boolean | number | string): void;
> Creates a session-level attribute shared by multiple mobile event types. Overwrites its previous value and type each time it is called.
  ```js
     NewRelic.setAttribute('RNCustomAttrNumber', 37);
  ```
### [removeAttribute](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/remove-attribute)(name: string, value: boolean | number | string): void;
> This method removes the attribute specified by the name string..
  ```js
     NewRelic.removeAttribute('RNCustomAttrNumber');
  ```

### [incrementAttribute](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/increment-attribute)(name: string, value?: number): void;
> Increments the count of an attribute with a specified name. Overwrites its previous value and type each time it is called. If the attribute does not exists, it creates a new attribute. If no value is given, it increments the value by 1.
```js
    NewRelic.incrementAttribute('RNCustomAttrNumber');
    NewRelic.incrementAttribute('RNCustomAttrNumber', 5);
```

### [setUserId](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/set-user-id)(userId: string): void;
> Set a custom user identifier value to associate user sessions with analytics events and attributes.
  ```js
     NewRelic.setUserId("RN12934");
  ```

### [recordBreadcrumb](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/recordbreadcrumb)(name: string, attributes?: {[key: string]: any}): void;
> Track app activity/screen that may be helpful for troubleshooting crashes.

  ```js
     NewRelic.recordBreadcrumb("shoe", {"shoeColor": "blue","shoesize": 9,"shoeLaces": true});
  ```

### [recordCustomEvent](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/recordcustomevent-android-sdk-api)(eventType: string, eventName?: string, attributes?: {[key: string]: any}): void;
> Creates and records a custom event for use in New Relic Insights.

  ```js
     NewRelic.recordCustomEvent("mobileClothes", "pants", {"pantsColor": "blue","pantssize": 32,"belt": true});
  ```

### [crashNow](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/crashnow-android-sdk-api)(message?: string): void;
> Throws a demo run-time exception to test New Relic crash reporting.

```js
    NewRelic.crashNow();
    NewRelic.crashNow("New Relic example crash message");
```

### [currentSessionId](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/currentsessionid-android-sdk-api)(): Promise;
> Returns the current session ID. This method is useful for consolidating monitoring of app data (not just New Relic data) based on a single session definition and identifier.
```js
    let sessionId = await NewRelic.currentSessionId();
```

### [noticeHttpTransaction](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/notice-http-transaction/)(url: string, httpMethod: string, statusCode: number, startTime: number, endTime: number, bytesSent: number, bytesReceived: number, responseBody: string): void;
> Tracks network requests manually. You can use this method to record HTTP transactions, with an option to also send a response body.
```js
    NewRelic.noticeHttpTransaction('https://github.com', 'GET', 200, Date.now(), Date.now()+1000, 100, 101, "response body");
```

### [noticeNetworkFailure](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/notice-network-failure)(url: string, httpMethod: string, startTime: number, endTime: number, failure: string): void; 
> Records network failures. If a network request fails, use this method to record details about the failures. In most cases, place this call inside exception handlers, such as catch blocks.
```js
    NewRelic.noticeNetworkFailure('https://github.com', 'GET', Date.now(), Date.now(), NewRelic.NetworkFailure.BadURL);
```

### [recordMetric](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/recordmetric-android-sdk-api)(name: string, category: string, value?: number, countUnit?: string, valueUnit?: string): void;
> Records custom metrics (arbitrary numerical data), where countUnit is the measurement unit of the metric count and valueUnit is the measurement unit for the metric value. If using countUnit or valueUnit, then all of value, countUnit, and valueUnit must all be set.
```js
    NewRelic.recordMetric('RNCustomMetricName', 'RNCustomMetricCategory');
    NewRelic.recordMetric('RNCustomMetricName', 'RNCustomMetricCategory', 12);
    NewRelic.recordMetric('RNCustomMetricName', 'RNCustomMetricCategory', 13, NewRelic.MetricUnit.PERCENT, NewRelic.MetricUnit.SECONDS);
```

### [removeAllAttributes](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/remove-all-attributes)(): void;
> Removes all attributes from the session
```js
    NewRelic.removeAllAttributes();
```

### recordError(e: string|error): void;
> Records javascript errors for react-native.
```js
    try {
      var foo = {};
      foo.bar();
    } catch(e) {
      NewRelic.recordError(e);
    }
```

### [setMaxEventBufferTime](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/set-max-event-buffer-time)(maxBufferTimeInSeconds: number): void;
> Sets the event harvest cycle length. Default is 600 seconds (10 minutes). Minimum value can not be less than 60 seconds. Maximum value should not be greater than 600 seconds.
```js
    NewRelic.setMaxEventBufferTime(60);
```

### [setMaxEventPoolSize](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/set-max-event-pool-size)(maxSize: number): void;
> Sets the maximum size of the event pool stored in memory until the next harvest cycle. Default is a maximum of 1000 events per event harvest cycle. When the pool size limit is reached, the agent will start sampling events, discarding some new and old, until the pool of events is sent in the next harvest cycle.
```js
    NewRelic.setMaxEventPoolSize(2000);
```

### The following methods allow you to set some agent configurations after the agent has started:
 Follow [these steps](https://github.com/newrelic/newrelic-react-native-agent/blob/main/README.md#react-native-setup) if the agent has not started yet.

### [analyticsEventEnabled](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/android-agent-configuration-feature-flags/#ff-analytics-events)(enabled: boolean) : void;
> FOR ANDROID ONLY. Enable or disable the collecton of event data.
```js
    NewRelic.analyticsEventEnabled(true);
```

### [networkRequestEnabled](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/android-agent-configuration-feature-flags/#ff-networkRequests)(enabled: boolean) : void;
> Enable or disable reporting successful HTTP requests to the MobileRequest event type.
```js
    NewRelic.networkRequestEnabled(true);
```

### [networkErrorRequestEnabled](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/android-agent-configuration-feature-flags/#ff-networkErrorRequests)(enabled: boolean) : void;
> Enable or disable reporting network and HTTP request errors to the MobileRequestError event type.
```js
    NewRelic.networkErrorRequestEnabled(true);
```

### [httpResponseBodyCaptureEnabled](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/android-agent-configuration-feature-flags/#ff-withHttpResponseBodyCaptureEnabled)(enabled: boolean) : void;
> Enable or disable capture of HTTP response bodies for HTTP error traces, and MobileRequestError events.
```js
    NewRelic.httpResponseBodyCaptureEnabled(true);
```

### [shutdown](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/shut-down/)() : void;
> Shut down the agent within the current application lifecycle during runtime.
```js
    NewRelic.shutdown();
```

## How to see JSErrors(Fatal/Non Fatal) in NewRelic One?

### React Native Agent v1.2.0 and above:
JavaScript errors and promise rejections can be seen in the `Handled Exceptions` tab in New Relic One. You will be able to see the event trail, attributes, and stack trace for each JavaScript error recorded. 

You can also build a dashboard for these errors using this query:

```sql
SELECT * FROM MobileHandledException SINCE 24 hours ago
```

### React Native Agent v1.1.0 and below: 
There is no section for JavaScript errors, but you can see JavaScript errors in custom events and also query them in NRQL explorer.

<img width="1753" alt="Screen Shot 2022-02-10 at 12 41 11 PM" src="https://user-images.githubusercontent.com/89222514/153474861-87213e70-c3fb-4e14-aee7-a6a3fb482f73.png">

You can also build dashboard for errors using this query:

  ```sql
  SELECT jsAppVersion,name,Message,errorStack,isFatal FROM `JS Errors` SINCE 24 hours ago
  ```

 ## Symbolicating a stack trace

The agent supports symbolication of JavaScript errors in debug mode only. Symbolicated errors are shown as Handled Exceptions in New Relic One. If you want to manually symboliate, please follow the steps described [here for Symbolication](https://reactnative.dev/docs/symbolication).

### Symbolication for Javascript errors are coming in future releases.

```angular2html
* IMPORTANT considerations and best practices include:
*
* - You should limit the total number of event types to approximately five.
* eventType is meant to be used for high-level categories.
* For example, you might create an event type Gestures.
*
* - Do not use eventType to name your custom events.
* Create an attribute to name an event or use the optional name parameter.
* You can create many custom events; it is only event types that you should limit.
*
* - Using the optional name parameter has the same effect as adding a name key in the attributes dictionary.
* name is a keyword used for displaying your events in the New Relic UI.

* To create a useful name, you might combine several attributes.
```

## Uploading dSYM files

Our iOS agent includes a Swift script intended to be run from a build script in your target's build phases in XCode. The script automatically uploads dSYM files in the background (or converts your dSYM to the New Relic map file format), and then performs a background upload of the files needed for crash symbolication to New Relic.

To invoke this script during an XCode build:
1. Copy the dsym-upload-tools folder from this repository: https://github.com/newrelic/newrelic-ios-agent-spm, to your projects SRCROOT folder first. 
1. In Xcode, select your project in the navigator, then click on the application target.
1. Select the Build Phases tab in the settings editor.
1. Click the + icon above Target Dependencies and choose New Run Script Build Phase. Ensure the new build script is the very last build script.
1. Add the following lines of code to the new phase and replace `APP_TOKEN` with your iOS application token.
    1. If there is a checkbox below Run script that says "Run script: Based on Dependency analysis" please make sure it is not checked.

### React Native agent 0.0.8 or higher
```
ARTIFACT_DIR="${BUILD_DIR%Build/*}"
SCRIPT=`/usr/bin/find "${SRCROOT}" "${ARTIFACT_DIR}" -type f -name run-symbol-tool | head -n 1`
/bin/sh "${SCRIPT}" "APP_TOKEN"
```
### React Native agent 0.0.7 or lower
```
SCRIPT=`/usr/bin/find "${SRCROOT}" -name newrelic_postbuild.sh | head -n 1`

if [ -z "${SCRIPT}"]; then
 ARTIFACT_DIR="${BUILD_DIR%Build/*}SourcePackages/artifacts"
 SCRIPT=`/usr/bin/find "${ARTIFACT_DIR}" -name newrelic_postbuild.sh | head -n 1`
fi

/bin/sh "${SCRIPT}" "APP_TOKEN"
```

#### Note: The automatic script requires bitcode to be disabled. You should clean and rebuild your app after adding the script. 

### Missing dSYMs
The automatic script will create an `upload_dsym_results.log` file in your project's iOS directory, which contains information about any failures that occur during symbol upload.

If dSYM files are missing, you may need to check Xcode build settings to ensure the file is being generated. Frameworks which are built locally have separate build settings and may need to be updated as well.

Build settings:
```
Debug Information Format : Dwarf with dSYM File
Deployment Postprocessing: Yes
Strip Linked Product: Yes
Strip Debug Symbols During Copy : Yes
```
### Configure app launch times

To measure app launch time, you can refer to the following documentation for both [Android](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/install-configure/configure-app-launch-time-android-apps/) and [iOS](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-ios/configuration/app-launch-times-ios-apps/) platforms.


## Testing
### Jest Configuration
By default, `node_modules` are ignored by transformers by Jest. To configure the newrelic-react-native-agent to work with Jest, you should add this package to [`transformIgnorePatterns`](https://jestjs.io/docs/configuration#transformignorepatterns-arraystring). We also provide some basic mocks for our API calls in `jestSetup.js`. Simply add this file to [`setupFiles`](https://jestjs.io/docs/configuration#setupfiles-array) in your Jest configuration. An example jest configuration would look like:
```json
  "jest": {
    "preset": "react-native",
    "transformIgnorePatterns": [
      "node_modules/(?!@react-native|react-native|newrelic-react-native-agent)"
    ],
    "setupFiles": [
      "./node_modules/newrelic-react-native-agent/jestSetup.js"
    ]
  }
```
