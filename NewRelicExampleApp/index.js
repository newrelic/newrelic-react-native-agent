/**
 * @format
 */

 import {AppRegistry} from 'react-native';
 import App from './App';
 import {name as appName} from './app.json';
 import * as keys from './newrelic.json';
 import NewRelic from 'newrelic-react-native-agent';
 
 //start the Agent
 NewRelic.startAgent(keys.licenseKey.ios);
 //set Attribute
 NewRelic.setAttribute("NewRelic RN App","1.0.0")
 // Adding Custom Event
 NewRelic.recordCustomEvent("MobileModularAgentTest", "react-native-modular-agent", {"platform1": Platform.OS, "appDidMount": "true"});
 NewRelic.setJSAppVersion("0.1.2");
 
 AppRegistry.registerComponent(appName, () => App);
 
