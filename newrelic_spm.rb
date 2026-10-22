# Embeds the NewRelic iOS agent's Swift package framework in the app when the podspec resolves
# the agent through Swift Package Manager (NEWRELIC_USE_SPM=1).
#
# == Why this exists
#
# React Native's `spm_dependency` (react-native/scripts/cocoapods/spm.rb) links a pod against
# Swift package products, but CocoaPods only embeds the frameworks of pods. NewRelic.xcframework
# is a dynamic binary target, so without this the app builds and then fails at launch with
# "dyld: Library not loaded: @rpath/NewRelic.framework/NewRelic". Xcode 26 and later archives
# also fail on the duplicate signature Xcode writes for a binary target used by a pod
# ("NewRelic.xcframework-ios.signature couldn't be copied to Signatures because an item with
# the same name already exists").
#
# React Native fixes both upstream in facebook/react-native#58781, which no released version
# has yet (0.86 and earlier). Until customers can rely on it, this does the same for this pod,
# with the same shell function, and steps aside when React Native already did it.
#
# == How it works
#
# The podspec calls NewRelicSPM.activate! in SPM mode. This file wraps CocoaPods' post_install
# stage so that, after the Podfile's own post_install block (react_native_post_install) has run,
# each app's "[CP] Embed Pods Frameworks" script also embeds NewRelic.framework from where
# Xcode builds it and removes this pod's duplicate xcframework signature. CocoaPods regenerates
# that script on every install, so apps need no Podfile changes, the app's own .xcodeproj is
# never edited, and turning SPM off leaves nothing behind.

module NewRelicSPM
  POD_NAME = 'newrelic-react-native-agent'.freeze
  FRAMEWORK = 'NewRelic'.freeze
  EMBED_FUNCTION = 'install_spm_framework'.freeze

  # From facebook/react-native#58781: embeds framework $1 from where Xcode builds binary targets
  # (the shared products dir) and source packages (PackageFrameworks, or UninstalledProducts when
  # archiving). A static framework is already linked into its consumer, so it is skipped.
  EMBED_FUNCTION_SOURCE = <<~'SH'.freeze
    install_spm_framework()
    {
      local dir
      for dir in "${PODS_CONFIGURATION_BUILD_DIR}" "${PODS_CONFIGURATION_BUILD_DIR}/PackageFrameworks" "${OBJROOT}/UninstalledProducts/${PLATFORM_NAME}"; do
        if [ -d "$dir/$1.framework" ]; then
          if file -b "$dir/$1.framework/$1" | grep -q "dynamically linked"; then
            install_framework "$dir/$1.framework"
          fi
          return
        fi
      done
    }
  SH

  # Xcode writes a binary target's xcframework signature both to the shared products dir and to
  # the build dir of the pod using it, and the archive fails on the duplicate, so the pod's copy
  # goes. A pod built into the shared products dir (newer React Native) has no second copy, and
  # this path then doesn't exist.
  SIGNATURE_CLEANUP = %(rm -f "${PODS_CONFIGURATION_BUILD_DIR}/#{POD_NAME}/#{FRAMEWORK}.xcframework-"*.signature\n).freeze

  # CocoaPods' embed script runs its install_framework calls before this line; ours go there too.
  ANCHOR = /^if \[ "\$\{COCOAPODS_PARALLEL_CODE_SIGN\}" == "true" \]; then$/.freeze

  class << self
    # Called by the podspec when the agent comes from SPM. The requirement ends up in the embed
    # script, so a version change rewrites it and Xcode runs the embed phase again.
    def activate!(url, requirement)
      @dependency = "# #{url} #{requirement}\n"
    end

    def active?
      !@dependency.nil?
    end

    def apply_post_install(installer)
      return unless active?

      installer.aggregate_targets.each do |aggregate_target|
        next unless aggregate_target.pod_targets.any? { |target| target.pod_name == POD_NAME }

        script_path = aggregate_target.embed_frameworks_script_path
        next unless File.exist?(script_path)

        script = File.read(script_path)
        # React Native with facebook/react-native#58781 (or an earlier pass of this) already embeds it.
        next if script.include?(%(#{EMBED_FUNCTION} "#{FRAMEWORK}"))

        unless script.match?(ANCHOR)
          raise Pod::Informative, "[#{POD_NAME}] Could not add #{FRAMEWORK}.framework to #{script_path}; " \
                                  'the app would fail to launch. Please report this to New Relic.'
        end

        function = script.include?("#{EMBED_FUNCTION}()") ? '' : EMBED_FUNCTION_SOURCE
        insert = %(#{function}#{@dependency}#{EMBED_FUNCTION} "#{FRAMEWORK}"\n#{SIGNATURE_CLEANUP})
        File.write(script_path, script.sub(ANCHOR) { "#{insert}#{$&}" })
        Pod::UI.puts "[#{POD_NAME}] Embedding #{FRAMEWORK}.framework in #{aggregate_target.name}" if defined?(Pod::UI)
      end
    end

    # Wraps Pod::Installer#run_podfile_post_install_hooks once per CocoaPods process; the
    # podspec can be evaluated several times per install.
    def install_hooks!
      return unless defined?(Pod::Installer)

      installer_class = Pod::Installer
      hook = :run_podfile_post_install_hooks
      original = :newrelic_spm_original_run_podfile_post_install_hooks
      return unless installer_class.method_defined?(hook) || installer_class.private_method_defined?(hook)
      return if installer_class.method_defined?(original) || installer_class.private_method_defined?(original)

      was_private = installer_class.private_method_defined?(hook)
      installer_class.class_eval do
        alias_method original, hook
        define_method(hook) do
          # After the Podfile's post_install block: react_native_post_install wires up the package.
          result = send(original)
          NewRelicSPM.apply_post_install(self)
          result
        end
      end
      installer_class.send(:private, hook) if was_private
    end
  end
end

NewRelicSPM.install_hooks!
