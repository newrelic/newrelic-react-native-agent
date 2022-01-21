/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

 import React from 'react';
 import NewRelic from 'newrelic-react-native-agent';
 import type {Node} from 'react';
 import {
   SafeAreaView,
   ScrollView,
   StatusBar,
   StyleSheet,
   Text,
   useColorScheme,
   View,
   Button
 } from 'react-native';
 import {
   Colors,
   DebugInstructions,
   Header,
   LearnMoreLinks,
   ReloadInstructions,
 } from 'react-native/Libraries/NewAppScreen';
 
 const Section = ({children, title}): Node => {
   const isDarkMode = useColorScheme() === 'dark';
   return (
     <View style={styles.sectionContainer}>
       <Text
         style={[
           styles.sectionTitle,
           {
             color: isDarkMode ? Colors.white : Colors.black,
           },
         ]}>
         {title}
       </Text>
       <Text
         style={[
           styles.sectionDescription,
           {
             color: isDarkMode ? Colors.light : Colors.dark,
           },
         ]}>
         {children}
       </Text>
     </View>
   );
 };
 
 const App: () => Node = () => {
   const isDarkMode = useColorScheme() === 'dark';
 
   const backgroundStyle = {
     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
   };
 
   //Http Error and InterAction Example
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
 
   // Http Request and Interaction Example
   const goodApiLoad = async () => {
     const interactionId = await NewRelic.startInteraction('StartLoadGoodApiCall');
     console.log(interactionId);
     const url = 'https://facebook.github.io/react-native/movies.json';
 
     NewRelic.recordBreadcrumb("Http Request Start",{
       "url":url,
       "starttine":new Date()
     })
     fetch(url)
       .then((response) => response.json())
       .then((responseJson) => {
         NewRelic.recordBreadcrumb("Http Request Success",{
           "response":responseJson,
           "url":url,
           "endtime":new Date()
         })
         console.log(responseJson);
         NewRelic.endInteraction(interactionId);
       })
       .catch((error) => {
         NewRelic.endInteraction(interactionId);
         console.error(error);
       });
   };
 
   //Promise Rejection Example
   // if user is not handling error in catch then it captures by our prmose rejection handler
   const promiseRejection = async () => {
     const interactionId = await NewRelic.startInteraction('PromiseRejectionCall');
     console.log(interactionId);
     const url = 'https://facebook.github.io/react-native/moviessssssssss.json';
     fetch(url)
       .then((response) => response.json())
       .then((responseJson) => {
         console.log(responseJson);
         NewRelic.endInteraction(interactionId);
       }) 
   };
 
   // JS Error Example
   // When Javascript throws error it captures by our Error Handler
   const throwError = () => {
      
      throw new Error("I am Error");
   }
 
   return (
     <SafeAreaView style={backgroundStyle}>
       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
       <Button title={'Bad API'} onPress={badApiLoad} color={'#3365f3'} />
 
       <View style={{
             backgroundColor: isDarkMode ? Colors.black : Colors.white,height: 10
           }}></View>
 
       <Button title={'Good API'} onPress={goodApiLoad} color={'#3365f3'} />
 
       <View style={{
             backgroundColor: isDarkMode ? Colors.black : Colors.white,height: 10
           }}></View>
 
      <Button title={'Promise Rejection Example'} onPress={promiseRejection} color={'#3365f3'} />
 
      <View style={{
             backgroundColor: isDarkMode ? Colors.black : Colors.white,height: 10
           }}></View>
 
      <Button title={'Error Example'} onPress={throwError} color={'#3365f3'} />
 
 
       <ScrollView
         contentInsetAdjustmentBehavior="automatic"
         style={backgroundStyle}>
         <Header />
         <View
           style={{
             backgroundColor: isDarkMode ? Colors.black : Colors.white,
           }}>
           <Section title="Step One">
             Edit <Text style={styles.highlight}>App.js</Text> to change this
             screen and then come back to see your edits.
           </Section>
           <Section title="See Your Changes">
             <ReloadInstructions />
           </Section>
           <Section title="Debug">
             <DebugInstructions />
           </Section>
           <Section title="Learn More">
             Read the docs to discover what to do next:
           </Section>
           <LearnMoreLinks />
         </View>
       </ScrollView>
     </SafeAreaView>
   );
 };
 
 const styles = StyleSheet.create({
   sectionContainer: {
     marginTop: 32,
     paddingHorizontal: 24,
   },
   sectionTitle: {
     fontSize: 24,
     fontWeight: '600',
   },
   sectionDescription: {
     marginTop: 8,
     fontSize: 18,
     fontWeight: '400',
   },
   highlight: {
     fontWeight: '700',
   },
 });
 
 export default App;
 