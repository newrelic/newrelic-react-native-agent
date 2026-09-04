"use strict";
/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultIosApiKeyEnvName = exports.defaultIosAppTokenEnvName = exports.withNewRelicDsymUploadBuildPhase = exports.withNewRelicDsymUploadFiles = void 0;
const dsymUpload_1 = require("./dsymUpload");
Object.defineProperty(exports, "withNewRelicDsymUploadFiles", { enumerable: true, get: function () { return dsymUpload_1.withNewRelicDsymUploadFiles; } });
Object.defineProperty(exports, "withNewRelicDsymUploadBuildPhase", { enumerable: true, get: function () { return dsymUpload_1.withNewRelicDsymUploadBuildPhase; } });
Object.defineProperty(exports, "defaultIosAppTokenEnvName", { enumerable: true, get: function () { return dsymUpload_1.defaultIosAppTokenEnvName; } });
Object.defineProperty(exports, "defaultIosApiKeyEnvName", { enumerable: true, get: function () { return dsymUpload_1.defaultIosApiKeyEnvName; } });
