#!/bin/bash

# --- 1. REQUIRE VERSION ---
if [ -z "$PASSED_VERSION" ]; then
    echo "::error::PASSED_VERSION missing"
    exit 1
fi

VERSION=$PASSED_VERSION

# --- 2. PARSE CHANGELOG.MD ---
# Starts at '## VERSION' and stops at the next '## [0-9]'
RELEASE_NOTES=$(awk "/^## ${VERSION}/{flag=1;next} /^## [0-9]/{flag=0} flag" CHANGELOG.md)

# Clean up bullets: converts '- ' to '* ' and captures all improvements
IMPROVEMENTS=$(echo "$RELEASE_NOTES" | grep "^[[:space:]]*-" | sed 's/^[[:space:]]*- /* /')

if [ -z "$IMPROVEMENTS" ]; then
    echo "::warning::No improvements found for version $VERSION."
    IMPROVEMENTS="* Updated version."
fi

# --- 3. CREATE THE MDX ---
RELEASE_DATE=$(date +%Y-%m-%d)

# Dynamically get the package name (e.g., newrelic-react-native-agent) from package.json
PACKAGE_NAME=$(jq -r '.name' package.json)
FINAL_DOWNLOAD_URL="https://www.npmjs.com/package/${PACKAGE_NAME}/v/${VERSION}"

cat > "release-notes.mdx" << EOF
---
subject: ${AGENT_TITLE}
releaseDate: '${RELEASE_DATE}'
version: ${VERSION}
downloadLink: '${FINAL_DOWNLOAD_URL}'
---

## Improvements

${IMPROVEMENTS}
EOF

# --- 4. EXPORT CONTRACT ---
echo "FINAL_VERSION=$VERSION" > release_info.env
echo "✅ Generated release-notes.mdx for version $VERSION"