=begin
  Copyright (c) 2022-present New Relic Corporation. All rights reserved.
  SPDX-License-Identifier: Apache-2.0 
=end

require 'json'
# Embeds NewRelic.framework in the app when the agent comes from SPM; see the file.
require_relative 'newrelic_spm'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

#NewRelic IOS Agent
newrelic_sdk_version = package['sdkVersions']['ios']['newrelic']

Pod::Spec.new do |s|
  s.name         = package['name']
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = "http://newrelic.com/mobile-monitoring"
  s.author       = { "New Relic" => "mobile@newrelic.com" }
  s.license             = {
    :type => 'Commercial',
    :text => File.open('LICENSE') {|io| io.read}
  }
#   todo: we have to make sure the zip matches this name.
  s.source         = { :http => 'file:' + '$PODS_TARGET_SRCROOT/../ios/ios-bridge.zip' }
  s.source_files = "ios/bridge/**/*.{h,m,mm,swift}"
  s.platforms    = { :ios => "15.0", :tvos => "15.0" }
  s.requires_arc = true

  # Opt-in Swift Package Manager consumption of the NewRelic iOS agent.
  # When `NEWRELIC_USE_SPM=1`, the agent is pulled from
  # https://github.com/newrelic/newrelic-ios-agent-spm as a binary XCFramework
  # via SPM instead of from the `NewRelicAgent` CocoaPods spec. Default stays
  # CocoaPods so existing consumers (including those on RN < 0.75) are
  # unaffected.
  #
  # Requires React Native >= 0.75 (the SPM helper lives in
  # react-native/scripts/cocoapods/spm.rb) AND a consumer Podfile that uses
  # `use_frameworks! :linkage => :dynamic`. Mixing static linkage with SPM
  # produces linker errors at build time.
  # newrelic_spm.rb (required above) embeds NewRelic.framework in the app,
  # which React Native's SPM helper doesn't do before facebook/react-native#58781.
  if ENV['NEWRELIC_USE_SPM'] == '1'
    unless defined?(SPM) && SPM.respond_to?(:dependency)
      raise 'NEWRELIC_USE_SPM=1 is set but the SPM helper is not loaded. ' \
            'This requires React Native >= 0.75 and a Podfile that imports ' \
            'react_native_pods.rb.'
    end
    spm_url = 'https://github.com/newrelic/newrelic-ios-agent-spm'
    # sdkVersions holds a CocoaPods requirement (`~> 7.7.8`, ">= 7.7.8, < 7.8.0"), which is
    # SPM's upToNextMinorVersion from 7.7.8. Passed as is, Xcode can't parse it as a version.
    spm_requirement = { kind: 'upToNextMinorVersion', minimumVersion: newrelic_sdk_version.sub(/\A\s*~>\s*/, '') }
    NewRelicSPM.activate!(spm_url, spm_requirement)
    SPM.dependency(s,
      url: spm_url,
      requirement: spm_requirement,
      products: ['NewRelic']
    )
  else
    s.dependency 'NewRelicAgent', newrelic_sdk_version
  end

  s.preserve_paths = '*.js'

  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
    s.dependency 'React-Core'
  end

  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    s.pod_target_xcconfig = {
      'DEFINES_MODULE' => 'YES',
      'GCC_PREPROCESSOR_DEFINITIONS' => '$(inherited) COCOAPODS=1 RCT_NEW_ARCH_ENABLED=1',
      "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
      "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
    }
  end
end

