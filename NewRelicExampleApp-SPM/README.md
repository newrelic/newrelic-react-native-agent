# NewRelicExampleApp-SPM

Minimal React Native 0.76 example demonstrating the **Swift Package Manager**
consumption path of `newrelic-react-native-agent`. The default
`NewRelicExampleApp/` (RN 0.72) covers the CocoaPods baseline; this app covers
the SPM opt-in path (`NEWRELIC_USE_SPM=1` + `use_frameworks! :linkage =>
:dynamic`).

## What's checked in vs. what you scaffold

This folder ships only the files that differ from a fresh `react-native init`:

- `package.json` — RN 0.76, agent dependency, react-navigation
- `index.js` — entry point that calls `NewRelic.startAgent(...)`
- `App.tsx` — single screen exercising the agent APIs
- `app.json`, `babel.config.js`, `metro.config.js`, `tsconfig.json`
- `ios/Podfile` — sets `NEWRELIC_USE_SPM=1` and `use_frameworks! :linkage => :dynamic`

The Xcode project (`ios/AwesomeProject.xcodeproj`), AppDelegate, Info.plist,
and the `android/` tree are NOT checked in — they should come from a fresh
`react-native init` so they match exactly what current consumers get from RN's
template.

## Bootstrapping

```bash
cd NewRelicExampleApp-SPM

# 1. Scaffold a fresh RN 0.76 project alongside the checked-in files.
#    The CLI needs a fully-qualified version (a published npm tag); pick the
#    same patch version as `react-native` in this folder's package.json.
npx @react-native-community/cli init AwesomeProject --version 0.76.5 --skip-install --directory .scaffold

# 2. Move generated native projects into place.
mv .scaffold/ios/AwesomeProject     ios/AwesomeProject
mv .scaffold/ios/AwesomeProject.xcodeproj   ios/AwesomeProject.xcodeproj
mv .scaffold/ios/AwesomeProject.xcworkspace ios/AwesomeProject.xcworkspace
mv .scaffold/ios/Gemfile  ios/Gemfile  2>/dev/null || true
mv .scaffold/android       android
rm -rf .scaffold

# 3. Install JS deps and pods.
npm install
cd ios && bundle install && bundle exec pod install && cd ..

# 4. Add your iOS app token to index.js (look for `appToken`).

# 5. Run.
npx react-native run-ios
```

## Verifying the SPM path is active

After `pod install`:

- `ios/Podfile.lock` should NOT contain `NewRelicAgent`.
- `ios/Pods/Pods.xcodeproj/project.pbxproj` should contain
  `XCRemoteSwiftPackageReference "newrelic-ios-agent-spm"`.

Switch back to the CocoaPods path by removing `ENV['NEWRELIC_USE_SPM'] = '1'`
and the `use_frameworks!` line from `ios/Podfile`, then re-run `pod install`.

## Smoke test

The single-screen `App.tsx` exposes buttons for:

- Recording a custom event
- Recording a handled exception
- Throwing a JS error
- Recording a breadcrumb
- Starting and ending an interaction

Tap each, then verify entries land in your NR1 mobile app's Events / Errors
views.

## New Architecture

To verify the SPM path under the new architecture:

```bash
cd ios && RCT_NEW_ARCH_ENABLED=1 bundle exec pod install && cd ..
```
