"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withNetworkAcessPermission = exports.withApplyNewRelicPlugin = exports.withBuildscriptDependency = void 0;
const applyPlugin_1 = require("./applyPlugin");
Object.defineProperty(exports, "withApplyNewRelicPlugin", { enumerable: true, get: function () { return applyPlugin_1.withApplyNewRelicPlugin; } });
const buildscriptDependency_1 = require("./buildscriptDependency");
Object.defineProperty(exports, "withBuildscriptDependency", { enumerable: true, get: function () { return buildscriptDependency_1.withBuildscriptDependency; } });
const permissions_1 = require("./permissions");
Object.defineProperty(exports, "withNetworkAcessPermission", { enumerable: true, get: function () { return permissions_1.withNetworkAcessPermission; } });
