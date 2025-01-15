/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

package com.NewRelic;

import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;


import javax.annotation.Nonnull;

public class NRMModularAgentModule extends ReactContextBaseJavaModule {

    private final NRMModularAgentModuleImpl impl;

    public NRMModularAgentModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.impl = new NRMModularAgentModuleImpl(reactContext);

    }

    @Override
    @Nonnull
    public String getName() {
        return NRMModularAgentModuleImpl.NAME;
    }

    @ReactMethod
    public void startAgent(String appKey, String agentVersion, String reactNativeVersion, ReadableMap config) {
        impl.startAgent(appKey, agentVersion, reactNativeVersion, config);
    }


    @ReactMethod
    public void isAgentStarted(Promise promise) {
        impl.isAgentStarted(promise);
    }

    @ReactMethod
    public void setJSAppVersion(String jsAppVersion) {
        impl.setJSAppVersion(jsAppVersion);
    }

    @ReactMethod
    public void analyticsEventEnabled(boolean enabled) {
        impl.analyticsEventEnabled(enabled);
    }

    @ReactMethod
    public void networkRequestEnabled(boolean enabled) {
        impl.networkRequestEnabled(enabled);
    }

    @ReactMethod
    public void networkErrorRequestEnabled(boolean enabled) {
        impl.networkErrorRequestEnabled(enabled);
    }

    @ReactMethod
    public void httpResponseBodyCaptureEnabled(boolean enabled) {
        impl.httpResponseBodyCaptureEnabled(enabled);
    }


    @ReactMethod
    public void recordCustomEvent(String eventType, String eventName, ReadableMap readableMap) {
        impl.recordCustomEvent(eventType, eventName, readableMap);
    }

    @ReactMethod
    public void addHTTPHeadersTrackingFor(ReadableArray readableArray) {
        impl.addHTTPHeadersTrackingFor(readableArray);
    }


    @ReactMethod
    public void crashNow(String message) {
        impl.crashNow(message);
    }

    @ReactMethod
    public void currentSessionId(Promise promise) {
        impl.currentSessionId(promise);
    }

    @ReactMethod
    public void noticeNetworkFailure(String url, String httpMethod, double startTime, double endTime, String failure) {
        impl.noticeNetworkFailure(url, httpMethod, startTime, endTime, failure);
    }

    @ReactMethod
    public void recordMetric(String name, String category, double value, String metricUnit, String valueUnit) {
        impl.recordMetric(name, category, value, metricUnit, valueUnit);
    }

    @ReactMethod
    public void removeAllAttributes() {
        impl.removeAllAttributes();
    }

    @ReactMethod
    public void setMaxEventBufferTime(int maxEventBufferTimeInSeconds) {
        impl.setMaxEventBufferTime(maxEventBufferTimeInSeconds);
    }

    @ReactMethod
    public void setMaxOfflineStorageSize(int megaBytes) {
       impl.setMaxOfflineStorageSize(megaBytes);
    }

    @ReactMethod
    public void setMaxEventPoolSize(int maxSize) {
       impl.setMaxEventPoolSize(maxSize);
    }

    @ReactMethod
    public void setStringAttribute(String key, String value) {
       impl.setStringAttribute(key, value);
    }


    @ReactMethod
    public void setBoolAttribute(String key, boolean value) {
        impl.setBoolAttribute(key, value);
    }

    @ReactMethod
    public void setNumberAttribute(String key, Double value) {
        impl.setNumberAttribute(key, value);
    }

    @ReactMethod
    public void removeAttribute(String key) {
       impl.removeAttribute(key);
    }

    @ReactMethod
    public void incrementAttribute(String key, Double value) {
        impl.incrementAttribute(key, value);
    }

    @ReactMethod
    public void setUserId(String userId) {
        impl.setUserId(userId);
    }

    @ReactMethod
    public void recordBreadcrumb(String eventName, ReadableMap attributes) {
        impl.recordBreadcrumb(eventName, attributes);
    }

    @ReactMethod
    public void startInteraction(String actionName, Promise promise) {
        impl.startInteraction(actionName, promise);
    }

    @ReactMethod
    public void endInteraction(String actionName) {
        impl.endInteraction(actionName);
    }

    @ReactMethod
    public void setInteractionName(String name) {
        impl.setInteractionName(name);
    }

    @ReactMethod
    public void nativeLog(String name, String message) {
        impl.nativeLog(name, message);
    }

    @ReactMethod
    public void noticeHttpTransaction(String url, String method,int statusCode, int startTime, int endTime, int bytesSent, int bytesReceived, String responseBody) {
        impl.noticeHttpTransaction(url, method, statusCode, startTime, endTime, bytesSent, bytesReceived, responseBody);
    }

    @ReactMethod
    public void logAttributes(ReadableMap attributes) {
        impl.logAttributes(attributes);
    }


    @ReactMethod
    public void recordStack(String errorName, String errorMessage, String errorStack, boolean isFatal, String jsAppVersion) {
         impl.recordStack(errorName, errorMessage, errorStack, isFatal, jsAppVersion);
    }

    @ReactMethod
    public void shutdown() {
        impl.shutdown();
    }

    @ReactMethod
    public void recordHandledException(ReadableMap exceptionDictionary) {
        impl.recordHandledException(exceptionDictionary);
    }
}
