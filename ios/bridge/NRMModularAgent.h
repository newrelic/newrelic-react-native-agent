/*
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 
 */


#ifdef RCT_NEW_ARCH_ENABLED
#import <RNNewRelicSpec/RNNewRelicSpec.h>
@interface NRMModularAgent: NSObject <NativeNewRelicModuleSpec>
#else
#import <React/RCTBridgeModule.h>
@interface NRMModularAgent: NSObject <RCTBridgeModule>
#endif
@end

