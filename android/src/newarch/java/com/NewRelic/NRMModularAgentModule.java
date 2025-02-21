/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

package com.NewRelic;


import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import javax.annotation.Nonnull;

public class NRMModularAgentModule extends NativeNewRelicModuleSpec {

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

    @Override
    public void startAgent(String appKey, String agentVersion, String reactNativeVersion, ReadableMap config) {
        impl.startAgent(appKey, agentVersion, reactNativeVersion, config);
    }

    @Override
    public void isAgentStarted(Promise promise) {
        impl.isAgentStarted(promise);
    }


    @Override
    public void setJSAppVersion(String jsAppVersion) {
        impl.setJSAppVersion(jsAppVersion);
    }

    @Override
    public void analyticsEventEnabled(boolean enabled) {
        impl.analyticsEventEnabled(enabled);
    }

    @Override
    public void networkRequestEnabled(boolean enabled) {
        impl.networkRequestEnabled(enabled);
    }

    @Override
    public void networkErrorRequestEnabled(boolean enabled) {
        impl.networkErrorRequestEnabled(enabled);
    }

    @Override
    public void httpResponseBodyCaptureEnabled(boolean enabled) {
        impl.httpResponseBodyCaptureEnabled(enabled);
    }


    @Override
    public void recordCustomEvent(String eventType, String eventName, ReadableMap readableMap) {
        impl.recordCustomEvent(eventType, eventName, readableMap);
    }

    @Override
    public void addHTTPHeadersTrackingFor(ReadableArray readableArray) {
        impl.addHTTPHeadersTrackingFor(readableArray);
    }


    @Override
    public void crashNow(String message) {
        impl.crashNow(message);
    }

    @Override
    public void currentSessionId(Promise promise) {
        impl.currentSessionId(promise);
    }

    @Override
    public void noticeNetworkFailure(String url, String httpMethod, double startTime, double endTime, String failure) {
        impl.noticeNetworkFailure(url, httpMethod, startTime, endTime, failure);
    }

    @Override
    public void recordMetric(String name, String category, double value, String metricUnit, String valueUnit) {
        impl.recordMetric(name, category, value, metricUnit, valueUnit);
    }

    @Override
    public void removeAllAttributes() {
        impl.removeAllAttributes();
    }

    @Override
    public void setMaxEventBufferTime(double maxEventBufferTimeInSeconds) {
        impl.setMaxEventBufferTime((int)maxEventBufferTimeInSeconds);
    }

    @Override
    public void setMaxOfflineStorageSize(double megaBytes) {
       impl.setMaxOfflineStorageSize((int)megaBytes);
    }

    @Override
    public void setMaxEventPoolSize(double maxSize) {
       impl.setMaxEventPoolSize((int)maxSize);
    }

    @Override
    public void setStringAttribute(String key, String value) {
       impl.setStringAttribute(key, value);
    }


    @Override
    public void setBoolAttribute(String key, boolean value) {
        impl.setBoolAttribute(key, value);
    }

    @Override
    public void setNumberAttribute(String key, double value) {
        impl.setNumberAttribute(key, value);
    }

    @Override
    public void removeAttribute(String key) {
       impl.removeAttribute(key);
    }

    @Override
    public void incrementAttribute(String key, double value) {
        impl.incrementAttribute(key, value);
    }

    @Override
    public void setUserId(String userId) {
        impl.setUserId(userId);
    }

    @Override
    public void recordBreadcrumb(String eventName, ReadableMap attributes) {
        impl.recordBreadcrumb(eventName, attributes);
    }

    @Override
    public void startInteraction(String actionName, Promise promise) {
        impl.startInteraction(actionName, promise);
    }

    @Override
    public void endInteraction(String actionName) {
        impl.endInteraction(actionName);
    }

    @Override
    public void setInteractionName(String name) {
        impl.setInteractionName(name);
    }


    @Override
    public void noticeHttpTransaction(String url, String method, double statusCode, double startTime, double endTime, double bytesSent, double bytesReceived, String responseBody) {
        impl.noticeHttpTransaction(url, method, (int)statusCode, (long)startTime, (long)endTime, (long)bytesSent, (long)bytesReceived, responseBody);
    }

    @Override
    public void logAttributes(ReadableMap attributes) {
        impl.logAttributes(attributes);
    }


    @Override
    public void recordStack(String errorName, String errorMessage, String errorStack, boolean isFatal, String jsAppVersion) {
         impl.recordStack(errorName, errorMessage, errorStack, isFatal, jsAppVersion);
    }

    @Override
    public void shutdown() {
        impl.shutdown();
    }

    @Override
    public void recordHandledException(ReadableMap exceptionDictionary) {
        impl.recordHandledException(exceptionDictionary);
    }
}
