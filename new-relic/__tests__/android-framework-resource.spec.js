/**
 * Copyright (c) 2022-present New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// The native Android agent reads these string resources to learn the framework and its version when the
// app starts the agent natively before JavaScript runs. They are plain XML, so nothing derives them from
// package.json; this test is what stops them going stale.
const fs = require('fs');
const path = require('path');

const resDir = path.join(__dirname, '..', '..', 'android', 'src', 'main', 'res', 'values');

function resource(file, name) {
    const xml = fs.readFileSync(path.join(resDir, file), 'utf8');
    const match = new RegExp(`<string name="${name}"[^>]*>([^<]*)</string>`).exec(xml);
    expect(match).not.toBeNull();
    return match[1].trim();
}

describe('Android framework string resources', () => {
    it('name this package as ReactNative', () => {
        expect(resource('com_newrelic_application_framework.xml', 'com_newrelic_application_framework')).toBe('ReactNative');
    });

    it('carry the package.json version (the update workflow bumps both)', () => {
        const { version } = require('../../package.json');
        expect(resource('com_newrelic_application_framework_version.xml', 'com_newrelic_application_framework_version')).toBe(version);
    });
});
