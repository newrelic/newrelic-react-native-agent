# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
### Changed
- Updated iOS Agent to fix the failure to archive bug.

## 0.6.0

### Added
- React Native 0.60 support! Keep in mind you will now need add our podspec to the iOS podfile and then: `cd ios && pod install`
 
## 0.5.2

### Added
- A brand new change log
- Added gradle.properties to support Android X.
- Added react-native.config.js the new way RN handle configs.
- Added framework.zip for temp podspec support.
- Added continueSession API, this will extend the current session.
  
### Removed
- Removed rnpm from package.json as its no longer supported

### Fixed
- Fix crash caused by `"null is not an object (evaluating ‘NRMModularAgent.isAgentStarted’)"` if agent isn't started as expected.
- Fixed the podspec to temporarily support local files.

### Deprecated
- `NewRelic.startAgent()` is deprecated. The New Relic Agent will be started automatically when imported into the JS app.
- `rnpm` command hooks are deprecated. In the future you will need to run a setup command from the `newrelic-mobile-cli`
