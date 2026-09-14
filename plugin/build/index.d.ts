/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { ConfigPlugin } from '@expo/config-plugins';
import { NewRelicPluginProps } from './android';
import { NewRelicIosPluginProps } from './ios';
type CombinedNewRelicPluginProps = NewRelicPluginProps & NewRelicIosPluginProps;
declare const _default: ConfigPlugin<void | CombinedNewRelicPluginProps>;
export default _default;
