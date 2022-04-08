#!/bin/bash

# The working directory of the process that runs this script should be the root of the app, or passed in
# the optional 'REACT_ROOTDIR' env var
#
# Arguments:
#    --staging: Use the staging upload endpoint
#
# Passed env vars:
#   PLATFORM (required): ios or android
#   REACT_ROOTDIR (optional): root directory of project
#   buildType (optional): release or debug

if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  . "$HOME/.nvm/nvm.sh"
elif [[ -x "$(command -v brew)" && -s "$(brew --prefix nvm)/nvm.sh" ]]; then
  . "$(brew --prefix nvm)/nvm.sh"
fi

if [ -z $PLATFORM ]
  then 
    echo "ERROR: PLATFORM envvar required."
    exit 1
fi

if [ "$1" == "--staging" ]; then
  STAGING=true
  echo "STAGING=true"
fi

ROOTDIR="${REACT_ROOTDIR:-$PWD}"

echo "PLATFORM=$PLATFORM"
echo "ROOTDIR=$ROOTDIR"
if [ ! -z $buildType ]
  then
    echo "BUILD_TYPE=$buildType"
fi

cd ${ROOTDIR}
echo "PWD=$PWD"

tempDirPath="./node_modules/newrelic-react-native-agent/new-relic/tmp"
if [ ! -e $tempDirPath ] 
  then
    echo "Creating a temp dir at $tempDirPath"
    mkdir -p $tempDirPath
fi
outputPath="$tempDirPath/tmp.js"
SOURCE_MAP_OUTPUT="$tempDirPath/sourcemap-tmp.map"

node ./node_modules/react-native/local-cli/cli.js bundle \
  --platform $PLATFORM \
  --entry-file ./index.js \
  --bundle-output $outputPath \
  --sourcemap-output $SOURCE_MAP_OUTPUT

echo "Created source map: $SOURCE_MAP_OUTPUT"

if [ -x "$(command -v newrelic-mobile-react-native)" ]; then
  newrelic-mobile-react-native rn-upload -f "$SOURCE_MAP_OUTPUT" --platform "$PLATFORM" --build-type "$buildType"
  exit 0
fi

cliIndex="./node_modules/newrelic-mobile-cli/index.js"
if [ ! -e $cliIndex ]
  then
    echo "JS source map was not uploaded. New Relic CLI not be found at $cliIndex"
    exit 1
fi

options="--verbose --file $SOURCE_MAP_OUTPUT --platform $PLATFORM --build-type $buildType"
if [ "$STAGING" = true ]
  then
    options="$options --staging"
fi

echo "Uploading with options: $options"
node ./$cliIndex rn-upload $options
