/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

#import "NRMAFatalJSErrorHandler.h"
#import <NewRelic/NewRelic.h>

// Thanks to this guard, we won't compile any of the C++ exception-handling
// logic below when we build for the old architecture -- matching the
// existing precedent in NRMModularAgent.mm. Old-arch's bridge already
// guards every JS callback invocation, so this escape path cannot occur
// there and jsi.h isn't needed.
#ifdef RCT_NEW_ARCH_ENABLED

#import <jsi/jsi.h>
#include <atomic>
#include <exception>

static std::terminate_handler nrma_previousTerminateHandler = nullptr;

// Guards against re-entering this handler if our own reporting logic
// itself faults -- a terminate_handler that throws/faults typically
// re-invokes std::terminate(), so without this a fault here could loop.
static std::atomic<bool> nrma_isHandlingTermination{false};

static NSString *NRMAStringFromStdString(const std::string &s) {
    NSString *result = [[NSString alloc] initWithBytes:s.data()
                                                  length:s.size()
                                                encoding:NSUTF8StringEncoding];
    return result ?: @"<unable to decode JS error text>";
}

// Recovers the exception currently propagating (we are only ever invoked
// as the installed std::terminate_handler) and reports it via NewRelic's
// existing recordJavascriptError: API. Never throws, never touches a live
// jsi::Runtime/Value.
//
// Verified on real hardware (see bug-bash-fixtures/RUNBOOK.md) that the
// exception actually escaping this call chain is an NSException, not a
// raw facebook::jsi::JSError as the pure-source investigation predicted.
// Traced the exact mechanism in RN's own source: RCTMessageThread::tryFunc
// (React/CxxModule/RCTMessageThread.mm) catches the propagating jsi::JSError
// via a plain `catch (const std::exception &ex)` (RCTCxxUtils.mm's
// tryAndReturnError), packages it into an NSError carrying the raw JS
// stack under the RCTJSRawStackTraceKey userInfo key, and hands it to
// RCTCxxBridge::handleError: -> RCTFatal() (React/Base/RCTAssert.m), which
// @throws a NEW NSException built from that NSError -- unconditionally in
// Release builds -- and it's THIS exception that escapes uncaught to
// std::terminate (bypassing New Relic's existing NSSetUncaughtExceptionHandler
// hook for reasons not yet fully traced).
//
// RCTFatal deliberately truncates the exception's .reason to 175 characters
// (RCTFormatError, for on-screen redbox display) -- the untruncated
// message+stack survive in userInfo[RCTUntruncatedMessageKey]
// ("Unhandled JS Exception: <message>\n\n<stack>"), and the raw stack
// alone is in userInfo[RCTJSRawStackTraceKey]. Prefer those over .reason.
// The facebook::jsi::JSError and generic std::exception catches below are
// kept as defensive fallbacks for any other RN/Hermes version or code
// path that might escape as a raw C++ exception instead of an NSException.
static void NRMAReportUncaughtJSError() {
    std::exception_ptr eptr = std::current_exception();
    if (!eptr) {
        return; // Not an uncaught-exception termination -- nothing to recover.
    }

    try {
        std::rethrow_exception(eptr);
    } catch (NSException *nsException) {
        NSString *stack = nsException.userInfo[@"RCTJSRawStackTraceKey"];
        NSString *message = nsException.userInfo[@"RCTUntruncatedMessageKey"] ?: nsException.reason ?: @"<no reason>";
        static NSString *const kUnhandledPrefix = @"Unhandled JS Exception: ";
        if ([message hasPrefix:kUnhandledPrefix]) {
            message = [message substringFromIndex:kUnhandledPrefix.length];
        }
        // RCTUntruncatedMessageKey is "message\n\nstack" combined (mirroring
        // jsi::JSIException::what()'s own construction) -- strip the stack
        // back off now that we have it separately and cleanly from
        // RCTJSRawStackTraceKey, so `message` stays just the message.
        NSRange doubleNewline = [message rangeOfString:@"\n\n"];
        if (doubleNewline.location != NSNotFound) {
            message = [message substringToIndex:doubleNewline.location];
        }
        [NRMAFatalJSErrorHandler nrma_reportUncaughtJSErrorWithMessage:message stack:stack];
    } catch (const facebook::jsi::JSError &jsError) {
        NSString *message = NRMAStringFromStdString(jsError.getMessage());
        NSString *stack = NRMAStringFromStdString(jsError.getStack());
        [NRMAFatalJSErrorHandler nrma_reportUncaughtJSErrorWithMessage:message stack:stack];
    } catch (const std::exception &ex) {
        // ex.what() on a jsi::JSIException subclass is already
        // "message\n\nstack" per jsi.cpp's construction; for a plain
        // std::exception it's whatever that type provides. Degraded, but
        // still real signal.
        NSString *message = NRMAStringFromStdString(std::string(ex.what()));
        [NRMAFatalJSErrorHandler nrma_reportUncaughtJSErrorWithMessage:message stack:nil];
    } catch (...) {
        // Completely unknown exception type -- nothing safe to extract.
    }
}

static void NRMATerminateHandler() {
    if (!nrma_isHandlingTermination.exchange(true)) {
        @autoreleasepool {
            NRMAReportUncaughtJSError();
        }
    }

    // A terminate_handler must never return. Chain to whatever handler was
    // previously installed so today's existing native-crash-reporting
    // behavior (PLCrashReporter picking up the resulting abort()/SIGABRT)
    // is fully preserved, unchanged. Null-guard the previous handler --
    // see getsentry/sentry-cocoa#1533 (a raw call to a null previous
    // handler crashed their crash handler).
    if (nrma_previousTerminateHandler != nullptr) {
        nrma_previousTerminateHandler();
    }
    std::abort();
}

#endif // RCT_NEW_ARCH_ENABLED

@implementation NRMAFatalJSErrorHandler

+ (void)installIfNeeded {
#ifdef RCT_NEW_ARCH_ENABLED
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        nrma_previousTerminateHandler = std::set_terminate(&NRMATerminateHandler);
    });
#else
    // No-op on the old architecture -- see class-level doc in the header.
#endif
}

+ (void)nrma_reportUncaughtJSErrorWithMessage:(NSString *)message
                                         stack:(NSString *)stack {
    @try {
        [NewRelic recordJavascriptError:@"UnhandledJSIError"
                                 message:message
                              stackTrace:(stack ?: @"")
                                 isFatal:YES
                   additionalAttributes:@{@"NRJSErrorSource": @"nativeTerminateHandler"}];
    } @catch (...) {
        // Never let our own reporting attempt introduce a new failure mode
        // inside a terminate handler.
    }
}

@end
