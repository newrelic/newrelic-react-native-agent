/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Reports an uncaught facebook::jsi::JSError that would otherwise crash the
 * app via std::terminate with zero JS-specific diagnostic information.
 *
 * Background: on React Native's New Architecture (Fabric), a JS exception
 * thrown inside a discrete/touch event handler (onPress, etc.) crosses the
 * JSI boundary via UIManagerBinding::dispatchEventToJS /
 * RuntimeScheduler::executeNowOnTheSameThread -- neither wraps that call in
 * a try/catch, unlike RuntimeScheduler::callExpiredTasks/startWorkLoop
 * (used for timers), which does and reports via JS's ErrorUtils. Verified
 * on real hardware (see bug-bash-fixtures/RUNBOOK.md) that what actually
 * escapes this path is an NSException (likely from RN's own
 * RCTFatal/RCTFatalException machinery wrapping the JS error somewhere in
 * the Fabric touch-dispatch glue), not a raw facebook::jsi::JSError as the
 * pure-source investigation predicted -- it bypasses New Relic's existing
 * NSSetUncaughtExceptionHandler hook for reasons not yet fully traced, and
 * eventually reaches std::terminate(), which by default calls
 * std::abort() (SIGABRT) -- still picked up as a *native* crash by New
 * Relic's existing crash reporter, but with no JS message, stack, or
 * MobileJSError event at all.
 *
 * +installIfNeeded installs a std::terminate handler (once) that recovers
 * whatever is propagating -- an NSException first (the path confirmed to
 * actually fire in practice; its .reason carries the JS error message),
 * with facebook::jsi::JSError and generic std::exception kept as
 * defensive fallbacks for any other RN/Hermes version or code path that
 * might escape as a raw C++ exception instead -- and reports it via
 * NewRelic's existing public recordJavascriptError: API before chaining
 * to whatever std::terminate handler was previously installed. It never
 * suppresses or delays the crash: std::terminate always proceeds to end
 * the process after this runs, exactly as it does today for every other
 * trigger of a fatal JS error.
 *
 * Declared unconditionally (no #ifdef at the call site) so callers never
 * need to know or care about architecture. The real implementation is
 * compiled only under RCT_NEW_ARCH_ENABLED, matching this file's existing
 * precedent for architecture-gated code; under the old architecture this
 * is a documented no-op, since old-arch's bridge already wraps every JS
 * callback invocation in a try/catch (MessageQueue.js's __guard()) and
 * this exact escape path cannot occur there.
 */
@interface NRMAFatalJSErrorHandler : NSObject

/// Installs the terminate handler. Idempotent -- safe to call more than
/// once; only the first call has any effect.
+ (void)installIfNeeded;

/// Formats and reports a recovered JS error. Split out as a pure
/// Objective-C entry point (no C++ exception machinery) so it's callable
/// directly from a test, independent of an actual std::terminate
/// invocation (which would kill the test process).
+ (void)nrma_reportUncaughtJSErrorWithMessage:(NSString *)message
                                         stack:(nullable NSString *)stack;

@end

NS_ASSUME_NONNULL_END
