
package com.NewRelic;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.Callback;
import com.newrelic.agent.android.NewRelic;
import com.newrelic.agent.android.ApplicationFramework;


import java.util.HashMap;
import java.util.Map;

public class NRMModularAgentModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public NRMModularAgentModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

    }

    @Override
    public String getName() {
        return "NRMModularAgent";
    }

    @ReactMethod
    public void startAgent(String appKey) {
        if (appKey != null) {
            Log.w("NRMA", "calling start agent for RN bridge is deprecated. The agent automatically starts on creation.");
            System.out.println(appKey);
            System.out.println(reactContext);

         
                        NewRelic.withApplicationToken(appKey)
                        .withApplicationFramework(ApplicationFramework.ReactNative)
                                .withCrashReportingEnabled(true)
                                .start(reactContext);
        }
    }

    Map<String, Object> mapToAttributes(ReadableMap readableMap) {
        Map<String, Object> attributeMap = new HashMap<String, Object>();
        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();

        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            switch (readableMap.getType(key)) {
                case Null:
                    Log.w("NRMA", "TODO!! Skipping NULL attribute in react-native shim recordCustomEvent ");
                    break;
                case Boolean:
                    attributeMap.put(key, readableMap.getBoolean(key));
                    break;
                case Number:
                    attributeMap.put(key, readableMap.getDouble(key));
                    break;
                case String:
                    attributeMap.put(key, readableMap.getString(key));
                    break;
                case Map:
                    Log.w("NRMA", "TODO!! Skipping MAP attribute in react-native shim recordCustomEvent ");
                    break;
                case Array:
                    Log.w("NRMA", "TODO!! Skipping ARRAY attribute in react-native shim recordCustomEvent ");
                    break;
            }
        }
        return attributeMap;
    }

    @ReactMethod
    public void isAgentStarted(String name, Callback callback) {
        callback.invoke(false, NewRelic.isStarted());
    }

    @ReactMethod
    public void setJSAppVersion(String jsAppVersion) {
        NewRelic.setAttribute("JSAppVersion", jsAppVersion);
    }

    @ReactMethod
    public void recordCustomEvent(String eventType, String eventName, ReadableMap readableMap) {
        NewRelic.recordCustomEvent(eventType, eventName, mapToAttributes(readableMap));
    }

    @ReactMethod
    public void setStringAttribute(String key, String value) {
        NewRelic.setAttribute(key, value);
    }

    @ReactMethod
    public void setBoolAttribute(String key, boolean value) {
        NewRelic.setAttribute(key, value);
    }

    @ReactMethod
    public void setNumberAttribute(String key, Double value) {
        if (value == value.longValue()) { // if value is without a decimal value, log it as a long.
            NewRelic.setAttribute(key, value.longValue());
        } else {
            NewRelic.setAttribute(key, value);
        }
    }

    @ReactMethod
    public void setUserId(String userId) {
        NewRelic.setUserId(userId);
    }

    @ReactMethod
    public void recordBreadcrumb(String eventName, ReadableMap attributes) {
        NewRelic.recordBreadcrumb(eventName, mapToAttributes(attributes));
    }

    @ReactMethod
    public void startInteraction(String actionName) {
        NewRelic.startInteraction(actionName);
    }

    @ReactMethod
    public void endInteraction(String actionName) {
        NewRelic.endInteraction(actionName);
    }

    @ReactMethod
    public void setInteractionName(String name) {
        NewRelic.setInteractionName(name);
    }

    @ReactMethod
    public void nativeLog(String name, String message) {

        NewRelic.setInteractionName("Console Events");

        Map<String, Object> logs = new HashMap<>();
        logs.put("Name", name);
        logs.put("Message", message);
        NewRelic.recordBreadcrumb("Console Logs",logs);
        NewRelic.recordCustomEvent("Console Events", "", logs);
    }

    @ReactMethod
    public void noticeHttpTransaction(String url, String method,int statusCode,int startTime,int endTime,int bytesSent,int bytesReceived,String responseBody) {
        NewRelic.noticeHttpTransaction(url,method,statusCode,startTime,endTime,bytesSent,bytesReceived,responseBody);
    }

//    @ReactMethod
//    public void continueSession() {
//        NewRelic.continueSession();
//    }

@ReactMethod
public void recordStack(String errorName, String errorMessage, String errorStack, boolean isFatal, String jsAppVersion) {

    try {

        Map<String,Object> crashEvents = new HashMap<>();
        crashEvents.put("Name", errorName);
        crashEvents.put("Message", errorMessage);
        crashEvents.put("isFatal", isFatal);
        crashEvents.put("jsAppVersion", jsAppVersion);
        //attribute limit is 4096
        crashEvents.put("errorStack", errorStack.substring(0,4090));

        NewRelic.recordBreadcrumb("JS Errors", crashEvents);
        NewRelic.recordCustomEvent("JS Errors", "", crashEvents);

        RNStackTrace rnStackTrace = new RNStackTrace(errorName, errorMessage, errorStack, isFatal, jsAppVersion);

    } catch (IllegalArgumentException e) {
        Log.w("NRMA", e.getMessage());
    }
}
}
