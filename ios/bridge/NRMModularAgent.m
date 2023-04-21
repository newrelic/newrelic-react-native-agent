/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */

#import "NRMModularAgent.h"
#import <NewRelic/NewRelic.h>


@interface NewRelic (Private)
+ (bool) isAgentStarted:(SEL _Nonnull)callingMethod;
+ (void) setPlatformVersion:(NSString*)version;
@end

@implementation NRMModularAgent

-(id)init {
    static dispatch_once_t predicate;
    
    dispatch_once(&predicate, ^{
    });
    return self;
}

+ (BOOL)requiresMainQueueSetup{
    return NO;
}

- (dispatch_queue_t)methodQueue{
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE()

// Refer to https://facebook.github.io/react-native/docs/native-modules-ios for a list of supported argument types

RCT_EXPORT_METHOD(startAgent:(NSString* _Nonnull)appKey agentVersion:(NSString* _Nonnull) agentVersion reactNativeVersion:(NSString* _Nonnull) reactNativeVersion
                  config:(NSDictionary* _Nullable)agentConfig
                  startWithResolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
    
    if([[agentConfig objectForKey:@"crashReportingEnabled"]boolValue] == NO) {
        [NewRelic disableFeatures:NRFeatureFlag_CrashReporting];
    }
    
     if ([[agentConfig objectForKey:@"networkRequestEnabled"]boolValue] == NO){
        [NewRelic disableFeatures:NRFeatureFlag_NetworkRequestEvents];
    }

     if ([[agentConfig objectForKey:@"networkErrorRequestEnabled"]boolValue] == NO){
        [NewRelic disableFeatures:NRFeatureFlag_RequestErrorEvents];
    }
    
    if([[agentConfig objectForKey:@"httpResponseBodyCaptureEnabled"]boolValue] == NO) {
        [NewRelic disableFeatures:NRFeatureFlag_HttpResponseBodyCapture];
    }
    if([[agentConfig objectForKey:@"webViewInstrumentation"]boolValue] == NO) {
        [NewRelic disableFeatures:NRFeatureFlag_WebViewInstrumentation];
    }
    
    if([[agentConfig objectForKey:@"interactionTracingEnabled"]boolValue] == NO) {
        [NewRelic disableFeatures:NRFeatureFlag_InteractionTracing];
    }
    
    //Default is NRLogLevelWarning
    NRLogLevels logLevel = NRLogLevelWarning;
    NSDictionary *logDict = @{
        @"ERROR": [NSNumber numberWithInt:NRLogLevelError],
        @"WARNING": [NSNumber numberWithInt:NRLogLevelWarning],
        @"INFO": [NSNumber numberWithInt:NRLogLevelInfo],
        @"VERBOSE": [NSNumber numberWithInt:NRLogLevelVerbose],
        @"AUDIT": [NSNumber numberWithInt:NRLogLevelAudit],
    };

    
    if ([[agentConfig objectForKey:@"logLevel"] length] != 0) {
        NSString* configLogLevel = [agentConfig objectForKey:@"logLevel"];
        if(configLogLevel != nil) {
            configLogLevel = [configLogLevel uppercaseString];
            NSNumber* newLogLevel = [logDict valueForKey:configLogLevel];
            if(newLogLevel != nil) {
                logLevel = [newLogLevel intValue];
            }
        }
    }
    
    if([[agentConfig objectForKey:@"loggingEnabled"]boolValue] == NO) {
        logLevel = NRLogLevelNone;
    }
    
    [NRLogger setLogLevels:logLevel];
    
    BOOL useDefaultCollectorAddress = [[agentConfig objectForKey:@"collectorAddress"] length] == 0;
    BOOL useDefaultCrashCollectorAddress = [[agentConfig objectForKey:@"crashCollectorAddress"] length] == 0;
    
    [NewRelic setPlatform:(NRMAApplicationPlatform)NRMAPlatform_ReactNative];
    [NewRelic setPlatformVersion:agentVersion];
    
    if (useDefaultCollectorAddress && useDefaultCrashCollectorAddress) {
        [NewRelic startWithApplicationToken: appKey];
    } else {
        NSString* collectorAddress = useDefaultCollectorAddress ? @"mobile-collector.newrelic.com" : [agentConfig objectForKey:@"collectorAddress"];
        NSString* crashCollectorAddress = useDefaultCrashCollectorAddress ? @"mobile-crash.newrelic.com" : [agentConfig objectForKey:@"crashCollectorAddress"];
        
        [NewRelic startWithApplicationToken:appKey
                        andCollectorAddress:collectorAddress
                   andCrashCollectorAddress:crashCollectorAddress];
    }

    [NewRelic setAttribute:@"React Native Version" value:reactNativeVersion];
    
    resolve(@(TRUE));
}


RCT_EXPORT_METHOD(isAgentStarted:(NSString* _Nonnull)call
                  callback: (RCTResponseSenderBlock)callback){
    callback(@[[NSNull null], @(TRUE)]);
}

RCT_EXPORT_METHOD(analyticsEventEnabled:(BOOL) enabled) {
    // This should only be an android method call, so we do nothing for iOS.
    return;
}

RCT_EXPORT_METHOD(networkRequestEnabled:(BOOL) enabled) {
    if(enabled) {
        [NewRelic enableFeatures:NRFeatureFlag_NetworkRequestEvents];
    } else {
        [NewRelic disableFeatures:NRFeatureFlag_NetworkRequestEvents];
    }
}

RCT_EXPORT_METHOD(networkErrorRequestEnabled:(BOOL) enabled) {
    if(enabled) {
        [NewRelic enableFeatures:NRFeatureFlag_RequestErrorEvents];
    } else {
        [NewRelic disableFeatures:NRFeatureFlag_RequestErrorEvents];
    }
}

RCT_EXPORT_METHOD(httpResponseBodyCaptureEnabled:(BOOL) enabled) {
    if(enabled) {
        [NewRelic enableFeatures:NRFeatureFlag_HttpResponseBodyCapture];
    } else {
        [NewRelic disableFeatures:NRFeatureFlag_HttpResponseBodyCapture];
    }
}

RCT_EXPORT_METHOD(recordBreadcrumb:(NSString* _Nonnull)eventName attributes:(NSDictionary* _Nullable)attributes) {
    [NewRelic recordBreadcrumb:eventName attributes:attributes];
}

RCT_EXPORT_METHOD(crashNow:(NSString* )message) {
    if([message length] == 0) {
        [NewRelic crashNow];
    } else {
        [NewRelic crashNow:message];
    }
}

RCT_EXPORT_METHOD(currentSessionId:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        NSString* sessionId = [NewRelic currentSessionId];
        resolve((NSString*)sessionId);
    } @catch (NSException *exception) {
        [NewRelic recordHandledException:exception];
        reject([exception name], [exception reason], nil);
    }
}

RCT_EXPORT_METHOD(noticeHttpTransaction:(NSString *)url
                  httpMethod:(NSString*)httpMethod
                  statusCode:(NSNumber* _Nonnull)statusCode
                  startTime:(double)startTime
                  endTime:(double)endTime
                  bytesSent:(NSNumber* _Nonnull)bytesSent
                  bytesReceived:(NSNumber* _Nonnull)bytesReceived
                  body:(NSString *)body) {
    
    NSURL *nsurl = [[NSURL alloc] initWithString:url];
    NSData* data = [body dataUsingEncoding:NSUTF8StringEncoding];

    [NewRelic noticeNetworkRequestForURL:nsurl
                              httpMethod:httpMethod
                               startTime:startTime
                                 endTime:endTime
                         responseHeaders:nil
                              statusCode:(long)[statusCode integerValue]
                               bytesSent:(long)[bytesSent integerValue]
                           bytesReceived:(long)[bytesReceived integerValue]
                            responseData:data
                            traceHeaders:nil
                               andParams:nil];
    
}

RCT_EXPORT_METHOD(noticeNetworkFailure:(NSString *)url
                  httpMethod:(NSString*)httpMethod
                  startTime:(double)startTime
                  endTime:(double)endTime
                  failure:(NSString* _Nonnull)failure) {
    NSURL *nsurl = [[NSURL alloc] initWithString:url];
    NSDictionary *dict = @{
        @"Unknown": [NSNumber numberWithInt:NRURLErrorUnknown],
        @"BadURL": [NSNumber numberWithInt:NRURLErrorBadURL],
        @"TimedOut": [NSNumber numberWithInt:NRURLErrorTimedOut],
        @"CannotConnectToHost": [NSNumber numberWithInt:NRURLErrorCannotConnectToHost],
        @"DNSLookupFailed": [NSNumber numberWithInt:NRURLErrorDNSLookupFailed],
        @"BadServerResponse": [NSNumber numberWithInt:NRURLErrorBadServerResponse],
        @"SecureConnectionFailed": [NSNumber numberWithInt:NRURLErrorSecureConnectionFailed],
    };
    NSInteger iOSFailureCode = [[dict valueForKey:failure] integerValue];
    [NewRelic noticeNetworkFailureForURL:nsurl httpMethod:httpMethod startTime:startTime endTime:endTime andFailureCode:iOSFailureCode];
}

RCT_EXPORT_METHOD(recordMetric:(NSString*)name
                  category:(NSString *)category
                  value:(NSNumber* _Nonnull)value
                  countUnit:(NSString *)countUnit
                  valueUnit:(NSString *)valueUnit) {
    
    NSDictionary *dict = @{
        @"PERCENT": kNRMetricUnitPercent,
        @"BYTES": kNRMetricUnitBytes,
        @"SECONDS": kNRMetricUnitSeconds,
        @"BYTES_PER_SECOND": kNRMetricUnitsBytesPerSecond,
        @"OPERATIONS": kNRMetricUnitsOperations
    };
    if(value < 0) {
        [NewRelic recordMetricWithName:name category:category];
    } else {
        if(countUnit == nil || valueUnit == nil) {
            [NewRelic recordMetricWithName:name category:category value:value];
        } else {
            [NewRelic recordMetricWithName:name category:category value:value valueUnits:dict[valueUnit] countUnits:dict[countUnit]];
        }
    }

}

RCT_EXPORT_METHOD(removeAllAttributes) {
    [NewRelic removeAllAttributes];
}

RCT_EXPORT_METHOD(setMaxEventBufferTime:(NSNumber* _Nonnull)seconds) {
    unsigned int uint_seconds = seconds.unsignedIntValue;
    [NewRelic setMaxEventBufferTime:uint_seconds];
}

RCT_EXPORT_METHOD(setMaxEventPoolSize:(NSNumber* _Nonnull)maxSize) {
    unsigned int uint_maxSize = maxSize.unsignedIntValue;
    [NewRelic setMaxEventPoolSize:uint_maxSize];
}

RCT_EXPORT_METHOD(setStringAttribute:(NSString* _Nonnull)key withString:(NSString* _Nonnull)value) {
    [NewRelic setAttribute:key value:value];
}

RCT_EXPORT_METHOD(setNumberAttribute:(NSString* _Nonnull)key withNumber:( NSNumber* _Nonnull)value) {
    [NewRelic setAttribute:key value:value];
}

RCT_EXPORT_METHOD(setBoolAttribute:(NSString* _Nonnull)key withBool:value) {
    [NewRelic setAttribute:key value:value];
}

RCT_EXPORT_METHOD(removeAttribute:(NSString *)name)
{
    [NewRelic removeAttribute:(NSString * _Nonnull)name];
}

RCT_EXPORT_METHOD(incrementAttribute:(NSString *)key withNumber:(NSNumber* _Nonnull)value) {
    [NewRelic incrementAttribute:key value:value];
}


RCT_EXPORT_METHOD(setUserId:(NSString* _Nonnull)userId) {
    [NewRelic setUserId:userId];
}

//RCT_EXPORT_METHOD(continueSession) {
//    [NewRelic continueSession];
//}

RCT_EXPORT_METHOD(setJSAppVersion:(NSString* _Nonnull)version) {
    [NewRelic setAttribute:@"JSBundleId" value:version];
}


RCT_EXPORT_METHOD(recordCustomEvent:(NSString* _Nonnull) eventType eventName:(NSString* _Nullable)eventName eventAttributes:(NSDictionary* _Nullable)attributes) {
    // todo: Not sure if we need to check the validity of these arguments at all..
    [NewRelic recordCustomEvent:eventType name:eventName attributes:attributes];
}

/**
 * Track a method as an interaction
 */
RCT_EXPORT_METHOD(startInteraction:(NSString *)interactionName
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSString* interactionId = [NewRelic startInteractionWithName:(NSString * _Null_unspecified)interactionName];
        resolve((NSString *)interactionId);
    } @catch (NSException *exception) {
        [NewRelic recordHandledException:exception];
        reject([exception name], [exception reason], nil);
    }
}

/**
 * End an interaction
 * Required. The string ID for the interaction you want to end.
 * This string is returned when you use startInteraction().
 */
RCT_EXPORT_METHOD(endInteraction:(NSString *)interactionId)
{
    [NewRelic stopCurrentInteraction:(NSString * _Null_unspecified)interactionId];
}


RCT_EXPORT_METHOD(nativeLog:(NSString* _Nonnull) name message:(NSString* _Nonnull) message) {
    NSDictionary *logs =  @{@"Name":name,@"Message": message};
    [NewRelic recordBreadcrumb:@"Console Events" attributes:logs];
    [NewRelic recordCustomEvent:@"Console Events" attributes:logs];
}

RCT_EXPORT_METHOD(recordStack:(NSString* _Nullable) errorName
                  errorMessage:(NSString* _Nullable)errorMessage
                  errorStack:(NSString* _Nullable)errorStack
                  isFatal:(NSNumber* _Nonnull)isFatal
                  jsAppVersion:(NSString* _Nullable)jsAppVersion) {
    
    if(errorName == nil || errorMessage == nil) {
        return;
    }
    // Error stack length may not be more than attribute length limit 4096. Odd reporting happens if length is more than 3994 here.
    NSRange needleRange = NSMakeRange(0,3994);
    NSString *error;
    if(errorStack != nil) {
        if(errorStack.length > 3994) {
            error = [errorStack substringWithRange:needleRange];
        } else {
            error = errorStack;
        }
    } else {
        error = @"";
    }
    NSDictionary *dict =  @{@"Name":errorName,@"Message": errorMessage,@"isFatal": isFatal,@"jsAppVersion": jsAppVersion,@"errorStack": error};
    [NewRelic recordBreadcrumb:@"JS Errors" attributes:dict];
    [NewRelic recordCustomEvent:@"JS Errors" attributes:dict];
}

RCT_EXPORT_METHOD(recordHandledException:(NSDictionary* _Nullable)exceptionDictionary) {
    if (exceptionDictionary == nil) {
        NSLog(@"[NRMA] Null dictionary given to recordHandledException");
        return;
    }
    NSMutableDictionary* attributes = [NSMutableDictionary new];
    attributes[@"name"] = exceptionDictionary[@"name"];
    attributes[@"reason"] = exceptionDictionary[@"message"];
    attributes[@"fatal"] = exceptionDictionary[@"isFatal"];
    attributes[@"cause"] = exceptionDictionary[@"message"];
    attributes[@"JSAppVersion"] = exceptionDictionary[@"JSAppVersion"];
    attributes[@"minify"] = exceptionDictionary[@"minify"];
    attributes[@"dev"] = exceptionDictionary[@"dev"];
    attributes[@"runModule"] = exceptionDictionary[@"runModule"];
    attributes[@"modulesOnly"] = exceptionDictionary[@"modulesOnly"];
    
    NSMutableDictionary* stackFramesDict = exceptionDictionary[@"stackFrames"];
    if(stackFramesDict == nil) {
        NSLog(@"[NRMA] No stack frames given to recordHandledException");
        return;
    }
    NSMutableArray* stackFramesArr = [NSMutableArray new];
    for (int i = 0; i < [stackFramesDict count]; ++i) {
        NSMutableDictionary* currStackFrame = stackFramesDict[@(i).stringValue];
        NSMutableDictionary* stackTraceElement = [NSMutableDictionary new];
        stackTraceElement[@"file"] = (currStackFrame[@"file"] && currStackFrame[@"file"] != [NSNull null]) ? currStackFrame[@"file"] : @" ";
        stackTraceElement[@"line"] = (currStackFrame[@"lineNumber"] && currStackFrame[@"lineNumber"] != [NSNull null]) ? currStackFrame[@"lineNumber"] : 0;
        stackTraceElement[@"method"] = (currStackFrame[@"methodName"] && currStackFrame[@"methodName"] != [NSNull null]) ? currStackFrame[@"methodName"] : @" ";
        stackTraceElement[@"class"] = @" ";
        [stackFramesArr addObject:stackTraceElement];
    }
    
    attributes[@"stackTraceElements"] = stackFramesArr;
    [NewRelic recordHandledExceptionWithStackTrace:attributes];
    
}

@end

