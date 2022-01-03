
# newrelic-mobile-rn

A React Native Native Module library for the modular agent. 

#### Current Support:
- Android API 21+
- peerDependencies: react-native, [mobile-cli](https://source.datanerd.us/mobile/mobile-cli)
- Expects a [newrelic.json](https://source.datanerd.us/mobile/documentation/blob/master/Agents/Modular/AgentConfiguration.md) file to live in the top level of the RN app.
- iOS 10
- depends on NewRelic_Mobile_iOS and newrelic-mobile-android

Native support levels based on [React Native requirements](https://github.com/facebook/react-native#-requirements)

## Installing

``` 
npm install newrelic-mobile-rn --registry https://pdx-artifacts.pdx.vm.datanerd.us/api/npm/newrelic-mobile-rn/
```



## Developing Locally
*First things first!* setup the project: `npm run setup`

Setup will add some pre hooks that makes committing the ios/bridge code easier. As of right now the ios/bridge needs to be zipped for pods.

If you are testing locally you can run `npm run build:pack-ios-bridge` which will bundle the ios/bridge into a zip. The pre commit hooks runs this command when changes are detected.

After making the changes to the source code, you can test your local changes in a react-native app. From the rn agent run `npm pack` now install the zip in your test project.

1. Bring your `newrelic-mobile-rn` changes into the sample app. (e.g.: the [modular-sample-react native app](https://source.datanerd.us/mobile/modular-sample-react-native).)

1. Run `npm install ./newrelic-mobile-rn` to install your local version of the project.  
1. run `npm install newrelic-mobile-cli`                                  
1. add `newrelic.json` to your project dir.
1. Internal/Staging Builds iOS:
   Add our internal pod source to `./ios` podfile of test project
   ```
   source 'git@source.datanerd.us:mobile/modular-pods.git'
   ```   
   Now add our ios agent podspec to your test apps podfile:
   ```
   pod 'newrelic-mobile-rn', :podspec => '../node_modules/newrelic-mobile-rn/newrelic-mobile-rn.podspec'
   ```
1. Run `cd ./ios && pod install && cd ..` to install the agent dependencies.
1. ~~Run react-native link~~ Linking is done automatically in react native 0.60+
1. Run `npx newrelic-mobile-react-native setup --verbose`
1. Internal/Staging Builds Android: 
In the project gradle of the test app under allprojects -> repositories add our internal maven.
``` 
maven {
         url "https://pdx-artifacts.pdx.vm.datanerd.us/newrelic-mobile-android"
     }
```
1. Test the app! 

## Contributing
We use Airbnb's JavaScript style guide, which is a mostly reasonable approach to JavaScript.

In your editor of choice enable ESLint.

If you use the auto-format feature for WebStorm download this xml file:

https://gist.github.com/mentos1386/aa18c110dc272514d592ec27e98128be

Go Preferences -> Editor -> Code Style -> click the gear and import a new schema name it "AirBnB"

Currently there are no auto-magic checks to enforce this...yet. If it gets too difficult to self enforce the style guide we will add steps as part of the build process.

## Updating platform shims
This requires you setup your aws credentials following the instructions under [configure the access keys](https://aws.amazon.com/developers/getting-started/nodejs/#configure-the-access-keys)

Your access keys can be found using : 

```newrelic-vault us read shared/build/mobile-modular-agent/AWS_ACCESS_KEY_ID```

```newrelic-vault us read shared/build/mobile-modular-agent/AWS_SECRET_ACCESS_KEY```

**iOS: Updating the NewRelic_Mobile_iOS.framework** 

Easy way: update `NewRelic_Mobile_iOS` in the package.json which updates the podspec dependency.


You'll need to install Core & the iOS frameworks following.

1. Update the `NRVersions:ios` key in `nr-versions.json` to what version you want to download from `download.datanerd.us`
1. Run `npm run prepare:ios` to download and install the ios dependencies

note: using `npm run prepare:ios` doesn't work when remotely (out of office) just copy the iOS & Core agent into `newrelic-mobile-rn/ios/`

**Android: Updating the newrelic-mobile-android.aar** 

newrelic-mobile-android-{version}.aar is also a committed asset in this react-native plugin.
The framework that will be zipped and included for customer use is in `android/libs/`. Local development will use the 
internal artifactory location `maven { url "https://pdx-artifacts.pdx.vm.datanerd.us/newrelic-mobile-android" }`

## Usage

```javascript
import NewRelic from "newrelic-mobile-rn"
    NewRelic.startAgent();
    //for source mapping to work
    NewRelic.setJSAppVersion(require('./package.json').version)
```

## Known Issues
There are some known quirks right now.

## Manual Installation:
#### Android

`REACT-NATIVE LINK` should take care of this for you. In case it doesn't consider the following:

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.NewRelic.NRMModularAgentPackage;` to the imports at the top of the file
  - Add `new NRMModularAgentPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':new-relic-modular-agent'
  	project(':new-relic-modular-agent').projectDir = new File(rootProject.projectDir, 	'../node_modules/new-relic-modular-agent/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':new-relic-modular-agent')
  	```

## Licensing
The papers repo is added as a submodule to this repo.
Add the papers check to you pre-commit hook, `.git/hooks/pre-commit`. This will ensure the licensing is up to date on the remote repo.

```
 #!/bin/bash
 python ${repo_root}/lcheck/LicenseReviewer/license_reviewer.py review
 if [ $? != 0  ]; then
   exit 1
 fi
```

## Steps for deploying to production

First thing remove the new relic publishConfig from package.json.

1. set the token or auth for npm using `npm login`
1. `npm run use:npmReadme` npm defaults to the README.md. Running that command will rename new relic's `README.md` to `git.README.md` and rename the `npm.README.md` to `README.md`
1. `npm pack` This will pack all files in the project that are not in the `.npmignore` and create a `newrelic-mobile-rn.tgz`. If there are files that shouldn't be in production add them to that file.
1. `npm publish ./newrelic-mobile-rn.tgz` this will publish the tgz file to npm. Take a look at the documentation for more [npm publish options.](https://docs.npmjs.com/cli/publish)
1. Finally clean up the project when you are done. Delete the tgz and reset the project to not commit the npm.readme readme swap. `npm run use:gitReadme` or `git stash`.


## Troubleshooting


#### 1. running `npx newrelic-mobile-react-native setup --verbose` causes error: `npm ERR! 404 Not Found - GET https://registry.npmjs.org/newrelic-mobile-react-native - Not found`
You likely need to install the newrelic-mobile-cli into the react-native project: `npm install newrelic-mobile-cli`
