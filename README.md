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
import * as appVesrion from './package.json';
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

    // Optional:Enable or disable crash reporting.
    crashReportingEnabled: true,

    // Optional:Enable or disable interaction tracing. Trace instrumentation still occurs, but no traces are harvested. This will disable default and custom interactions.
    interactionTracingEnabled: true,

    // Optional:Enable or disable reporting successful HTTP requests to the MobileRequest event type.
    networkRequestEnabled: true,

    // Optional:Enable or disable reporting network and HTTP request errors to the MobileRequestError event type.
    networkErrorRequestEnabled: true,

    // Optional:Enable or disable capture of HTTP response bodies for HTTP error traces, and MobileRequestError events.
    httpRequestBodyCaptureEnabled: true,

   //Android Specific
   // Optional: Enable or disable agent logging.
    loggingEnabled: true,

    //iOS Specific
    // Optional:Enable/Disable automatic instrumentation of WebViews
    webViewInstrumentation: true
  };


NewRelic.startAgent(appToken,agentConfiguration);
NewRelic.setJSAppVersion(appVesrion.version);
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
        classpath "com.newrelic.agent.android:agent-gradle-plugin:6.8.0"
      }
    }
  ```

3. Update `app/build.gradle`:
  ```groovy
    apply plugin: "com.android.application"
    apply plugin: 'newrelic' // <-- add this
  
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

* [Bare Workflow](https://docs.expo.dev/introduction/managed-vs-bare/#bare-workflow): Please follow the above installation steps instead.
* [Managed Workflow](https://docs.expo.dev/introduction/managed-vs-bare/#bare-workflow): After installing our package, add the config plugin to the plugins array of your `app.json` or `app.config.js`.

```js
{
  "name": "my app",
  "plugins": ["newrelic-react-native-agent"]
}

```

After this, you need to use the `expo prebuild --clean` command as described in the  ["Adding custom native code"](https://docs.expo.dev/workflow/customizing/)guide to rebuild your app with the plugin changes. If this command is not running, you'll get errors when starting the New Relic agent.

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

### [setUserId](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/set-user-id)(userId: string): void;
> Set a custom user identifier value to associate user sessions with analytics events and attributes.
  ```js
     NewRelic.setUserId("RN12934");
  ```

### [recordBreadcrumb](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/recordbreadcrumb)(name: string, attributes?: {[key: string]: boolean | number | string}): void;
> Track app activity/screen that may be helpful for troubleshooting crashes.

  ```js
     NewRelic.recordBreadcrumb("shoe", {"shoeColor": "blue","shoesize": 9,"shoeLaces": true});
  ```

### [recordCustomEvent](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api/recordcustomevent-android-sdk-api)(eventType: string, eventName?: string, attributes?: {[key: string]: boolean | number | string}): void;
> Creates and records a custom event for use in New Relic Insights.

  ```js
     NewRelic.recordCustomEvent("mobileClothes", "pants", {"pantsColor": "blue","pantssize": 32,"belt": true});
  ```


## How to see JSerros(Fatal/Non Fatal) in NewRelic One?

There is no section for JavaScript errors, but you can see JavaScript errors in custom events and also query them in NRQL explorer.

<img width="1753" alt="Screen Shot 2022-02-10 at 12 41 11 PM" src="https://user-images.githubusercontent.com/89222514/153474861-87213e70-c3fb-4e14-aee7-a6a3fb482f73.png">

You can also build dashboard for errors using this query:

  ```sql
  SELECT jsAppVersion,name,Message,errorStack,isFatal FROM `JS Errors` SINCE 24 hours ago
  ```

 ## Symbolicating a stack trace

Currently there is no symbolication of Javascript errors. Please follow the steps described [here for Symbolication](https://reactnative.dev/docs/0.64/symbolication).

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
