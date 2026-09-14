"use strict";
/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAppTokenEnvName = exports.defaultApiKeyEnvName = exports.withNewRelicMapUploadProperties = exports.withNetworkAcessPermission = exports.withApplyNewRelicPlugin = exports.withBuildscriptDependency = void 0;
const applyPlugin_1 = require("./applyPlugin");
Object.defineProperty(exports, "withApplyNewRelicPlugin", { enumerable: true, get: function () { return applyPlugin_1.withApplyNewRelicPlugin; } });
const buildscriptDependency_1 = require("./buildscriptDependency");
Object.defineProperty(exports, "withBuildscriptDependency", { enumerable: true, get: function () { return buildscriptDependency_1.withBuildscriptDependency; } });
const permissions_1 = require("./permissions");
Object.defineProperty(exports, "withNetworkAcessPermission", { enumerable: true, get: function () { return permissions_1.withNetworkAcessPermission; } });
const mapUploadProperties_1 = require("./mapUploadProperties");
Object.defineProperty(exports, "withNewRelicMapUploadProperties", { enumerable: true, get: function () { return mapUploadProperties_1.withNewRelicMapUploadProperties; } });
Object.defineProperty(exports, "defaultApiKeyEnvName", { enumerable: true, get: function () { return mapUploadProperties_1.defaultApiKeyEnvName; } });
Object.defineProperty(exports, "defaultAppTokenEnvName", { enumerable: true, get: function () { return mapUploadProperties_1.defaultAppTokenEnvName; } });
