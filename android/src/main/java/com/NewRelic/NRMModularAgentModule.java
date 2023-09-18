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
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.Callback;
import com.newrelic.agent.android.FeatureFlag;
import com.newrelic.agent.android.NewRelic;
import com.newrelic.agent.android.ApplicationFramework;
import com.newrelic.agent.android.logging.AgentLog;
import com.newrelic.agent.android.stats.StatsEngine;
import com.newrelic.agent.android.metric.MetricUnit;
import com.newrelic.agent.android.util.NetworkFailure;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
    public void startAgent(String appKey, String agentVersion, String reactNativeVersion, ReadableMap config) {
        if (appKey != null) {
            Log.w("NRMA", "calling start agent for RN bridge is deprecated. The agent automatically starts on creation.");

            Map<String, Object> agentConfig = mapToAttributes(config);

            if ((Boolean) agentConfig.get("analyticsEventEnabled")) {
                NewRelic.enableFeature(FeatureFlag.AnalyticsEvents);
            } else {
                NewRelic.disableFeature(FeatureFlag.AnalyticsEvents);
            }

            if ((Boolean) agentConfig.get("networkRequestEnabled")) {
                NewRelic.enableFeature(FeatureFlag.NetworkRequests);
            } else {
                NewRelic.disableFeature(FeatureFlag.NetworkRequests);
            }
            if ((Boolean) agentConfig.get("networkErrorRequestEnabled")) {
                NewRelic.enableFeature(FeatureFlag.NetworkErrorRequests);
            } else {
                NewRelic.disableFeature(FeatureFlag.NetworkErrorRequests);
            }

            if ((Boolean) agentConfig.get("httpResponseBodyCaptureEnabled")) {
                NewRelic.enableFeature(FeatureFlag.HttpResponseBodyCapture);
            } else {
                NewRelic.disableFeature(FeatureFlag.HttpResponseBodyCapture);
            }

            if ((Boolean) agentConfig.get("crashReportingEnabled")) {
                NewRelic.enableFeature(FeatureFlag.CrashReporting);
            } else {
                NewRelic.disableFeature(FeatureFlag.CrashReporting);
            }

            if ((Boolean) agentConfig.get("interactionTracingEnabled")) {
                NewRelic.enableFeature(FeatureFlag.InteractionTracing);
            } else {
                NewRelic.disableFeature(FeatureFlag.InteractionTracing);
            }

            if ((Boolean) agentConfig.get("fedRampEnabled")) {
                NewRelic.enableFeature(FeatureFlag.FedRampEnabled);
            } else {
                NewRelic.disableFeature(FeatureFlag.FedRampEnabled);
            }

            if ((Boolean) agentConfig.get("nativeCrashReportingEnabled")) {
                NewRelic.enableFeature(FeatureFlag.NativeReporting);
            } else {
                NewRelic.disableFeature(FeatureFlag.NativeReporting);
            }

            Map<String, Integer> strToLogLevel = new HashMap<>();
            strToLogLevel.put("ERROR", AgentLog.ERROR);
            strToLogLevel.put("WARNING", AgentLog.WARN);
            strToLogLevel.put("INFO", AgentLog.INFO);
            strToLogLevel.put("VERBOSE", AgentLog.VERBOSE);
            strToLogLevel.put("AUDIT", AgentLog.AUDIT);

            // INFO is default log level
            int logLevel = AgentLog.INFO;
            if (agentConfig.get("logLevel") != null) {
                String configLogLevel = (String) agentConfig.get("logLevel");
                if(configLogLevel != null) {
                    configLogLevel = configLogLevel.toUpperCase();
                    if(strToLogLevel.containsKey(configLogLevel)) {
                        logLevel = strToLogLevel.get(configLogLevel);
                    }
                }
            }

            boolean useDefaultCollectorAddress =
                    agentConfig.get("collectorAddress") == null ||
                    ((String) agentConfig.get("collectorAddress")).isEmpty();
            boolean useDefaultCrashCollectorAddress =
                    agentConfig.get("crashCollectorAddress") == null ||
                    ((String) agentConfig.get("crashCollectorAddress")).isEmpty();

            if(useDefaultCollectorAddress && useDefaultCrashCollectorAddress) {
                NewRelic.withApplicationToken(appKey)
                        .withApplicationFramework(ApplicationFramework.ReactNative, agentVersion)
                        .withLoggingEnabled((Boolean) agentConfig.get("loggingEnabled"))
                        .withLogLevel(logLevel)
                        .start(reactContext);
            } else {
                String collectorAddress = useDefaultCollectorAddress ? "mobile-collector.newrelic.com" : (String) agentConfig.get("collectorAddress");
                String crashCollectorAddress = useDefaultCrashCollectorAddress ? "mobile-crash.newrelic.com" : (String) agentConfig.get("crashCollectorAddress");
                NewRelic.withApplicationToken(appKey)
                        .withApplicationFramework(ApplicationFramework.ReactNative, agentVersion)
                        .withLoggingEnabled((Boolean) agentConfig.get("loggingEnabled"))
                        .withLogLevel(logLevel)
                        .usingCollectorAddress(collectorAddress)
                        .usingCrashCollectorAddress(crashCollectorAddress)
                        .start(reactContext);
            }

            NewRelic.setAttribute("React Native Version", reactNativeVersion);
            StatsEngine.get().inc("Supportability/Mobile/Android/ReactNative/Agent/" + agentVersion);
            StatsEngine.get().inc("Supportability/Mobile/Android/ReactNative/Framework/" + reactNativeVersion);
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
        NewRelic.setAttribute("JSBundleId", jsAppVersion);
    }

    @ReactMethod
    public void analyticsEventEnabled(boolean enabled) {
        if(enabled) {
            NewRelic.enableFeature(FeatureFlag.AnalyticsEvents);
        } else {
            NewRelic.disableFeature(FeatureFlag.AnalyticsEvents);
        }
    }

    @ReactMethod
    public void networkRequestEnabled(boolean enabled) {
        if(enabled) {
            NewRelic.enableFeature(FeatureFlag.NetworkRequests);
        } else {
            NewRelic.disableFeature(FeatureFlag.NetworkRequests);
        }
    }

    @ReactMethod
    public void networkErrorRequestEnabled(boolean enabled) {
        if(enabled) {
            NewRelic.enableFeature(FeatureFlag.NetworkErrorRequests);
        } else {
            NewRelic.disableFeature(FeatureFlag.NetworkErrorRequests);
        }
    }

    @ReactMethod
    public void httpResponseBodyCaptureEnabled(boolean enabled) {
        if(enabled) {
            NewRelic.enableFeature(FeatureFlag.HttpResponseBodyCapture);
        } else {
            NewRelic.disableFeature(FeatureFlag.HttpResponseBodyCapture);
        }
    }


    @ReactMethod
    public void recordCustomEvent(String eventType, String eventName, ReadableMap readableMap) {
        NewRelic.recordCustomEvent(eventType, eventName, mapToAttributes(readableMap));
    }

    @ReactMethod
    public void crashNow(String message) {
        if(message.isEmpty()) {
            NewRelic.crashNow();
        } else {
            NewRelic.crashNow(message);
        }
    }

    @ReactMethod
    public void currentSessionId(Promise promise) {
        try {
            String sessionId = NewRelic.currentSessionId();
            promise.resolve(sessionId);
        } catch (Exception e) {
            e.printStackTrace();
            NewRelic.recordHandledException(e);
            promise.reject(e);
        }
    }

    @ReactMethod
    public void noticeNetworkFailure(String url, String httpMethod, double startTime, double endTime, String failure) {
        Map<String, NetworkFailure> strToNetworkFailure = new HashMap<>();
        strToNetworkFailure.put("Unknown", NetworkFailure.Unknown);
        strToNetworkFailure.put("BadURL", NetworkFailure.BadURL);
        strToNetworkFailure.put("TimedOut", NetworkFailure.TimedOut);
        strToNetworkFailure.put("CannotConnectToHost", NetworkFailure.CannotConnectToHost);
        strToNetworkFailure.put("DNSLookupFailed", NetworkFailure.DNSLookupFailed);
        strToNetworkFailure.put("BadServerResponse", NetworkFailure.BadServerResponse);
        strToNetworkFailure.put("SecureConnectionFailed", NetworkFailure.SecureConnectionFailed);
        NewRelic.noticeNetworkFailure(url, httpMethod, (long) startTime, (long) endTime, strToNetworkFailure.get(failure));
    }

    @ReactMethod
    public void recordMetric(String name, String category, double value, String metricUnit, String valueUnit) {
        Map<String, MetricUnit> strToMetricUnit = new HashMap<>();
        strToMetricUnit.put("PERCENT", MetricUnit.PERCENT);
        strToMetricUnit.put("BYTES", MetricUnit.BYTES);
        strToMetricUnit.put("SECONDS", MetricUnit.SECONDS);
        strToMetricUnit.put("BYTES_PER_SECOND", MetricUnit.BYTES_PER_SECOND);
        strToMetricUnit.put("OPERATIONS", MetricUnit.OPERATIONS);

        if(value < 0) {
            NewRelic.recordMetric(name, category);
        } else {
            if(metricUnit == null || valueUnit == null) {
                NewRelic.recordMetric(name, category, value);
            } else {
                NewRelic.recordMetric(name, category, 1, value, value, strToMetricUnit.get(metricUnit), strToMetricUnit.get(valueUnit));
            }
        }
    }

    @ReactMethod
    public void removeAllAttributes() {
        NewRelic.removeAllAttributes();
    }

    @ReactMethod
    public void setMaxEventBufferTime(int maxEventBufferTimeInSeconds) {
        NewRelic.setMaxEventBufferTime(maxEventBufferTimeInSeconds);
    }

    @ReactMethod
    public void setMaxEventPoolSize(int maxSize) {
        NewRelic.setMaxEventPoolSize(maxSize);
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
    public void removeAttribute(String key) {
        NewRelic.removeAttribute(key);
    }

    @ReactMethod
    public void incrementAttribute(String key, Double value) {
        if(value == value.longValue()) {
            NewRelic.incrementAttribute(key, value.longValue());
        } else {
            NewRelic.incrementAttribute(key, value);
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
    public void startInteraction(String actionName, Promise promise) {
        try {
            String interactionId = NewRelic.startInteraction(actionName);
            promise.resolve(interactionId);
        } catch (Exception e) {
            e.printStackTrace();
            NewRelic.recordHandledException(e);
            promise.reject(e);
        }
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
        NewRelic.recordBreadcrumb("Console Logs", logs);
        NewRelic.recordCustomEvent("Console Events", "", logs);
    }

    @ReactMethod
    public void noticeHttpTransaction(String url, String method, int statusCode, int startTime, int endTime, int bytesSent, int bytesReceived, String responseBody) {
        NewRelic.noticeHttpTransaction(url, method, statusCode, startTime, endTime, bytesSent, bytesReceived, responseBody);
    }


    @ReactMethod
    public void recordStack(String errorName, String errorMessage, String errorStack, boolean isFatal, String jsAppVersion) {

        try {

            Map<String, Object> crashEvents = new HashMap<>();
            crashEvents.put("Name", errorName);
            crashEvents.put("Message", errorMessage);
            crashEvents.put("isFatal", isFatal);
            crashEvents.put("jsAppVersion", jsAppVersion);
            if (errorStack != null) {
                //attribute limit is 4096
                crashEvents.put("errorStack", errorStack.length() > 4095 ? errorStack.substring(0, 4094) : errorStack);
            }

            NewRelic.recordBreadcrumb("JS Errors", crashEvents);
            NewRelic.recordCustomEvent("JS Errors", "", crashEvents);

            StatsEngine.get().inc("Supportability/Mobile/ReactNative/JSError");


        } catch (IllegalArgumentException e) {
            Log.w("NRMA", e.getMessage());
        }
    }

    @ReactMethod
    public void shutdown() {
        NewRelic.shutdown();
    }

    @ReactMethod
    public void recordHandledException(ReadableMap exceptionDictionary) {
        if(exceptionDictionary == null) {
            Log.w("NRMA", "Null dictionary given to recordHandledException");
        }

        Map<String, Object> exceptionMap = exceptionDictionary.toHashMap();
        // Remove these attributes to avoid conflict with existing attributes
        exceptionMap.remove("app");
        exceptionMap.remove("platform");

        if(!exceptionMap.containsKey("stackFrames")) {
            Log.w("NRMA", "No stack frames in recordHandledException");
            return;
        }
        Map<String, Object> stackFramesMap = (Map<String, Object>) exceptionMap.get("stackFrames");
        NewRelicReactNativeException exception = new NewRelicReactNativeException(
                (String) exceptionMap.get("message"),
                generateStackTraceElements(stackFramesMap));
        exceptionMap.remove("stackFrames");
        NewRelic.recordHandledException(exception, exceptionMap);
    }

    private StackTraceElement[] generateStackTraceElements(Map<String, Object> stackFrameMap) {
        try {
            List<StackTraceElement> stackTraceList = new ArrayList<>();
            for(int i = 0; i < stackFrameMap.size(); ++i) {
                Map<String, Object> element = (Map<String, Object>) stackFrameMap.get(Integer.toString(i));
                String methodName = null;
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                    methodName = (String) element.getOrDefault("methodName", "");
                } else {
                    if (element.containsKey("methodName")) {
                        methodName = (String)element.get("methodName");
                    }
                }
                String fileName = null;
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                    fileName = (String) element.getOrDefault("file", "");
                } else {
                    if (element.containsKey("file")) {
                        fileName = (String)element.get("file");
                    }
                }
                int lineNumber = element.get("lineNumber") != null ? ((Double) element.get("lineNumber")).intValue() : 1;
                StackTraceElement stackTraceElement = new StackTraceElement(" ", methodName, fileName, lineNumber);
                stackTraceList.add(stackTraceElement);
            }
            return stackTraceList.toArray(new StackTraceElement[0]);
        } catch(Exception e) {
            NewRelic.recordHandledException(e);
            return null;
        }
    }
}
