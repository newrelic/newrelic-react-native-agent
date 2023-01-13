# Changelog

0.0.9

## New in this release

* Updated Native Android Agent Version


## Fixed in this release

* Reduced bundle size of agent
* Fixed issue where pod hash would change on different builds 


0.0.8
## New in this release

* Added hot and cold app launch time. You can find more information here: [Android](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-android/install-configure/configure-app-launch-time-android-apps) and [iOS](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-ios/configuration/app-launch-times-ios-apps)


## Fixed in this release

* Fix for recursive call for react native navigation for <=v4
* Removed jcenter from Android

0.0.7
## Fixed in this release
* Fixed an issue where error stack trace length would cause crashing in iOS apps.

0.0.6

## New in this release
* Add methods that are currently available in the android and XCFramework agents.
* Add `recordError` to record javascript errors for react-native.
* Add methods to set agent configuration after the agent has started.


## Fixed in this release
* Fixed an issue where null errors in the global react native handler would cause errors on the XCFramework agent module.

0.0.5

Fixed issue where JS Errors are not recording for iOS apps when Error stack length is lesser than 4096

0.0.4
Fix Null Pointer Exception Crash

0.0.3
Add Routing Instrumentation which will capture the current screen and record it as breadcrumb. Add support for Native Agent's Features Configuration

 0.0.2
 Fix ErrorStack null crash

 0.0.1
 React Native Agent GA release