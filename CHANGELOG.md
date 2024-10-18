# Changelog

## 1.4.6

## Improvements

- Native Android agent updated to version 7.6.1
- Native iOS agent updated to version 7.5.2

## 1.4.5

## Improvements

- Native Android agent updated to version 7.6.0


## 1.4.4

## Bug Fixes

- Fixed an issue causing the application to crash when transitioning to the background due to a mismatch between the Android and NDK agents.


## 1.4.3

## New Features

1. **Distributed Tracing Control**
   - Introducing a new feature flag: `distributedTracingEnabled`, providing the ability to enable or disable distributed tracing functionality.

## Bug Fixes

- Addressed an issue where console debug logs were incorrectly displayed as console errors.


## 1.4.1
## New Features

1. Application Exit Information
  - Added ApplicationExitInfo to data reporting
  - Enabled by default

2. Log Forwarding to New Relic
  - Implement static API for sending logs to New Relic
  - Can be enabled/disabled in your mobile application's entity settings page

## Improvements

- Native Android agent updated to version 7.5.0
- Native iOS agent updated to version 7.5.0

## 1.4.0

## Important Notice

This is an Unpublished Version

**Build Status**: Failed

We encountered issues during the build process for this version. As a result, it has not been published and is not available for general use.


## 1.3.9

* Updated the native Android agent to version 7.3.1.


## 1.3.8

* Improvements
The native iOS Agent has been updated to version 7.4.12, bringing performance enhancements and bug fixes.

* New Features
A new backgroundReportingEnabled feature flag has been introduced to enable background reporting functionality.
A new newEventSystemEnabled feature flag has been added to enable the new event system.

* Changes
The interactionTracingEnabled feature flag has been disabled by default to prevent potential crashes from occurring.


## 1.3.7

* Updated native iOS Agent: We've upgraded the native iOS agent to version 7.4.10, which includes performance improvements and bug fixes.


## 1.3.6

### New in this release
* Added Offline Harvesting Feature: This new feature enables the preservation of harvest data that would otherwise be lost when the application lacks an internet connection. The stored harvests will be sent once the internet connection is re-established and the next harvest upload is successful.
* Introduced setMaxOfflineStorageSize API: This new API allows the user to determine the maximum volume of data that can be stored locally. This aids in better management and control of local data storage.
* Updated native iOS Agent: We've upgraded the native iOS agent to version 7.4.9, which includes performance improvements and bug fixes.
* Updated native Android Agent: We've also upgraded the native Android agent to version 7.3.0 bringing benefits like improved stability and enhanced features.
* Added compatibility for Android dynamic features.
* Resolved an issue where events were not being reported in the event of a forceful termination of the application.

These enhancements help to improve overall user experience and application performance.


## 1.3.5

### New in this release
* Adds configurable request header instrumentation to network events
The agent will now produce network event attributes for select header values if the headers are detected on the request. The header names to instrument are passed into the agent when started.
* Updated the native Android agent to version 7.2.0.
* Updated the native iOS agent to version 7.4.8.

## 1.3.4

### Please refrain from using this release, as it encountered compilation errors during the iOS development process.

### New in this release
* Adds configurable request header instrumentation to network events
The agent will now produce network event attributes for select header values if the headers are detected on the request. The header names to instrument are passed into the agent when started.
* Updated the native Android agent to version 7.2.0.
* Updated the native iOS agent to version 7.4.8.

## 1.3.3

### New in this release
* Updated the native Android agent to version 7.1.0.
* Addressed an issue that prevented app building due to missing compilesdk.

## 1.3.2

### New in this release
* Resolved a problem preventing apps from building due to an undefined package associated with AGP 4 compatibility.
* Addressed an issue with recordHandledException where users were unable to call this method for Android API levels 21 through 23


## 1.3.1

### New in this release
* Upgraded native iOS agent to v7.4.6
* Added Native C/C++ Crash Capture Support for Android


## 1.3.0

### New in this release
* Upgraded native Android agent to v7.0.0
* Added support for React Native 0.72.0
* Included support for Expo 49

## 1.2.1

### New in this release
* Upgrade native iOS agent to v7.4.5
* Added FedRAMP configuration flag on agent start.

## 1.2.0

### New in this release
* Upgrade native Android Agent to v6.11.1
* Upgrade native iOS agent to v7.4.4
* JavaScript Errors will now be reported as handled exceptions, providing more context and stack traces in the New Relic UI. Errors will only be symbolicated on debug mode.
* Added shutdown method, providing ability to shut down the agent within the current application lifecycle during runtime.

### Fixed in this release
* Fixed an issue where the feature flag methods would result in an error.

## 1.1.0

### New in this release
* Upgrade native Android agent to v6.10.0
* Upgrade native iOS agent to v7.4.3

### Fixed in this release
* Fixed an issue that caused conflicts with network monitoring in FlipperKit.

## 1.0.1

### Fixed in this release
* Cyclical structures are now removed when sent to the console, preventing large circular structures from causing an out-of-memory issue on Android.

## 1.0.0

### New in this release
* TypeScript support has been added, providing improved type checking and better coding experience for TypeScript users.
* The ability to configure collector endpoints and logging level has been added, providing more control over the data collection process.
* The ability to turn off logging for iOS has been added, providing more control over the data collection process.

### Fixed in this release
* Unhandled promise rejection handler will now handle null errors generated by React Native, ensuring that the application continues to run smoothly.
* Cyclical structures are now properly handled when sent to the console, avoiding potential errors and crashes in the logging process.


## 0.0.9

### New in this release

* Updated Native Android Agent Version


### Fixed in this release

* Reduced bundle size of agent
* Fixed issue where pod hash would change on different builds 


## 0.0.8
### New in this release

* Added hot and cold app launch time. You can find more information here: [Android](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/install-configure/configure-app-launch-time-android-apps) and [iOS](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-ios/configuration/app-launch-times-ios-apps)


### Fixed in this release

* Fix for recursive call for react native navigation for <=v4
* Removed jcenter from Android

## 0.0.7
### Fixed in this release
* Fixed an issue where error stack trace length would cause crashing in iOS apps.

## 0.0.6

### New in this release
* Add methods that are currently available in the android and XCFramework agents.
* Add `recordError` to record javascript errors for react-native.
* Add methods to set agent configuration after the agent has started.


### Fixed in this release
* Fixed an issue where null errors in the global react native handler would cause errors on the XCFramework agent module.

## 0.0.5

* Fixed issue where JS Errors are not recording for iOS apps when Error stack length is lesser than 4096

## 0.0.4
* Fix Null Pointer Exception Crash

## 0.0.3
* Add Routing Instrumentation which will capture the current screen and record it as breadcrumb. 
* Add support for Native Agent's Features Configuration

## 0.0.2
* Fix ErrorStack null crash

## 0.0.1
* React Native Agent GA release