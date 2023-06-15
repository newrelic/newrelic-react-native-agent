import React, { useRef } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../Browser';

type BrowserProps = {
    route: RouteProp<RootStackParamList, 'Browser'>;
};

const BrowserScreen: React.FC<BrowserProps> = ({route}: BrowserProps) => {
    const webViewRef = useRef<any>();
    const {title, url} = route.params

    const goBackHandler = () => {
        webViewRef.current.goBack();
    };

    const goForwardHandler = () => {
        webViewRef.current.goForward();
    }

    return (
        <>
            <View style={styles.screen}>
                <View style={styles.navbar}>
                    <View style={styles.forward}>
                        <Button
                            title="Forward"
                            onPress={goForwardHandler}
                        />
                    </View>
                    <View style={styles.urlText}>
                        <Text numberOfLines={1}>{title}</Text>
                    </View>
                    <View style={styles.back}>
                        <Button
                            title="Back"
                            onPress={goBackHandler}
                        />
                    </View>
                </View>
                <WebView
                    originWhitelist={['*']}
                    ref={webViewRef}
                    source={{uri: url}}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    navbar: {
        height: 50,
        width: '100%',
        flexDirection: 'row-reverse',
        paddingTop: 6,
        backgroundColor: '#fefefe',
        borderTopColor: 'grey',
        borderTopWidth: 1,
    },
    back: {
        width: 100,
        height: 100,
    },
    forward: {
        width: 100,
        height: 100,
    },
    urlText: {
        overflow: 'hidden',
        flex: 1,
    },
  });

export default BrowserScreen;