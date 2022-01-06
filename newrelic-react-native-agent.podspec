require 'json'
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
  s.source         = { :http => 'file:' + __dir__ + '/ios/ios-bridge.zip' }
  s.source_files = "ios/bridge/**/*.{h,m}"
  s.platform     = :ios, '9.0'
  s.requires_arc = true

# todo: change these to their public repos - changes these to the correct versions
  s.dependency 'NewRelicAgent', newrelic_sdk_version
#

  s.preserve_paths = '*.js'

  s.dependency 'React'
end

