
# newrelic-react-native-agent

This agent utilizes native New Relic agents to expose the Javascript environment. The New Relic SDKs collect crashes, network traffic, and other information for hybrid apps using native components.

### Features
* Capture JavaScript errors
* Network Instrumentation
* Distributed Tracing
* Tracking console log, warn and error
* Promise rejection tracking
* Capture interactions and the sequence in which they were created
* Pass user information to New Relic to track user sessions
* Expo Support (Bare Workflow & Managed Workflow)


#### Current Support:
- Android API 21+
- iOS 10
- depends on New Relic iOS/XCFramework and Android agents

Native support levels based on [React Native requirements](https://github.com/facebook/react-native#-requirements)

### Requirements
- React Native >= 0.63
- IOS native requirements https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-ios/get-started/new-relic-ios-compatibility-requirements
- Android native requirements https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/get-started/new-relic-android-compatibility-requirements


## Installation
- Yarn
```sh
# yarn add @bibabovn/react-native-newrelic
```
- Don't forget to run:
```shell
  npx pod-install
```

### React Native Setup

- Start Agent From index.js

```js
NewRelic.startAgent("GENERATED_TOKEN");

```
"GENERATED_TOKEN" is Platform Specific. User needs to genrate for Android and iOS apps.


### Android Setup
- Install the New Relic native Android agent ([instructions here](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/install-configure/install-android-apps-gradle-android-studio))
- Update build.gradle:
  ```java
    buildscript {
      ...
      repositories {
        ...
        mavenCentral()
      }
      dependencies {
        ...
        classpath "com.newrelic.agent.android:agent-gradle-plugin:6.3.1"
      }
    }
  ```

- Update app/build.gradle
  ```
    apply plugin: "com.android.application"
    apply plugin: 'newrelic' // <-- add this

- Set app permissions
  - Ensure that your app requests INTERNET and ACCESS_NETWORK_STATE permissions by adding these lines to your AndroidManifest.xml.
  ```
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />    
  ```

### iOS Setup
- Run this and it will install the New Relic XCFramework agent
```shell
  npx pod-install
```

### AutoLinking and rebuilding
 - Once the above steps have been completed, the React Native Firebase library must be linked to your project and your application needs to be rebuilt.

 - Users on React Native 0.60+ automatically have access to "autolinking", requiring no further manual installation steps. To automatically link the package, rebuild your project:
```shell
# Android apps
npx react-native run-android

# iOS apps
cd ios/
pod install --repo-update
cd ..
npx react-native run-ios
```
### Expo

Integration with Expo is possible in both bare workflow and [custom managed workflow](https://docs.expo.io/workflow/customizing/) via [config plugins](https://docs.expo.io/guides/config-plugins/).

### Installation

if you are using [Bare Workflow](https://docs.expo.dev/introduction/managed-vs-bare/#bare-workflow),Please follow the above installation steps instead.

if you are using [Managed Workflow](https://docs.expo.dev/introduction/managed-vs-bare/#bare-workflow) after installing our package,add the config plugin to the plugins array of your app.json or app.config.js.

After this,you need to use the  <span style="color:orange;">expo prebuild --clean </span> command as described in the  ["Adding custom native code"](https://docs.expo.dev/workflow/customizing/)guide to rebuild your app with the plugin changes. if this command is not running,you will get error to start New Relic Agent.



## Usage
See [New Relic IOS SDK doc](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-ios/ios-sdk-api) or [Android SDK](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/android-sdk-api) for more detail

### startInteraction(interactionName: string): Promise<InteractionId>;
> Track a method as an interaction
- `InteractionId` is string

### setInteractionName(interactionName: string): void;
> Name or rename interaction (Android Specific)

### endInteraction(id: InteractionId): void;
> End an interaction
> Required. The string ID for the interaction you want to end.
> This string is returned when you use startInteraction().


#### setAttribute(name: string, value: boolean | number | string): void;
> Create or update an attribute

### setUserId(userId: string): void;
> Set custom user ID for associating sessions with events and attributes

### recordBreadcrumb(name: string, attributes?: {[key: string]: boolean | number | string}): void;
> Track app activity/screen that may be helpful for troubleshooting crashes

### recordCustomEvent(eventType: string, eventName?: string, attributes?: {[key: string]: boolean | number | string}): void;
> Creates and records a custom event, for use in New Relic Insights
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
