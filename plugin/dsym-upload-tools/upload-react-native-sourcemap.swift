//
//  upload-react-native-sourcemap.swift
//  2026 New Relic
//
// Swift script used to upload React Native source maps to New Relic.
// Intended to be run from a Xcode build phase.
//
// 1. In Xcode, select your project in the navigator, then click on the application target.
// 2. Select the Build Phases tab in the settings editor.
// 3. Click the + icon above Target Dependencies and choose New Run Script Build Phase.
// 4. Add the following lines of code to the new phase AFTER "Bundle React Native code and images",
//    replacing YOUR_INGEST_API_KEY and YOUR_APP_TOKEN with your actual keys:
//
// ```
//  SCRIPT=`/usr/bin/find "${SRCROOT}" -name upload-react-native-sourcemap | head -n 1`
//  /bin/sh "${SCRIPT}" "YOUR_INGEST_API_KEY" "YOUR_APP_TOKEN"
// ```
//
// Where:
//  - YOUR_INGEST_API_KEY: Get from https://one.newrelic.com/api-keys
//  - YOUR_APP_TOKEN: Your New Relic Mobile App Token (same one used by the agent)
//
// Optional:
//
// Add "--debug" as third argument to enable debug logs in the output upload_sourcemap_results.log file.
//
// ```
//  SCRIPT=`/usr/bin/find "${SRCROOT}" -name upload-react-native-sourcemap | head -n 1`
//  /bin/sh "${SCRIPT}" "YOUR_INGEST_API_KEY" "YOUR_APP_TOKEN" --debug
// ```
//
// Region:
// The upload host is derived from the app token's region prefix:
//   US (no prefix)  -> https://symbol-ingest-api.service.newrelic.com
//   EU (eu01x...)   -> https://symbol-ingest-api.service.eu.newrelic.com
//   JP (jp01x...)   -> https://symbol-ingest-api.service.jp.newrelic.com
// Setting SOURCEMAP_UPLOAD_URL overrides the auto-detected host.
//
// Environment Variables (optional):
// SOURCEMAP_UPLOAD_URL - Override the New Relic server hostname
// SOURCEMAP_PATH - Override the default source map location (${DERIVED_FILE_DIR}/main.jsbundle.map)
//
// ============================================================================
// START of Script upload-react-native-sourcemap.swift
import Foundation

let defaultURL = "https://symbol-ingest-api.service.newrelic.com"
let fileManager = FileManager.default
let environment = ProcessInfo.processInfo.environment
// Set to true for additional debug info in the upload_sourcemap_results.log file.
var debug = false

var sourcemapEndpointPath = "v1/react-native/sourcemaps"
var sourcemapUploadDataPostKey = "sourcemap"
let telemetryDataHeader = "x-telemetry-data"

// Maximum file size: 200MB
let maxFileSizeBytes: UInt64 = 209715200

enum SourceMapToolError: Error {
    case sourceMapNotFound
    case failedToUpload
    case fileTooLarge
    case invalidConfiguration
}

start()

func start() {
    print("New Relic: Starting React Native source map upload script...")

    // Only run for Release builds
    guard let configuration = environment["CONFIGURATION"], configuration == "Release" else {
        print("New Relic: Skipping source map upload (not a Release build)")
        exit(0)
    }

    // Skip simulator builds (unless testing)
    let platformName = environment["EFFECTIVE_PLATFORM_NAME"]
    let allowSimulator = environment["NEWRELIC_SOURCEMAP_ALLOW_SIMULATOR"] == "true"
    if platformName == "-iphonesimulator" && !allowSimulator {
        print("New Relic: Skipping source map upload for simulator build")
        print("New Relic: Set NEWRELIC_SOURCEMAP_ALLOW_SIMULATOR=true to enable simulator uploads for testing")
        exit(0)
    }

    // Check for disabled flag
    if environment["NEWRELIC_SOURCEMAP_UPLOAD_DISABLED"] == "true" {
        print("New Relic: Source map upload is disabled via NEWRELIC_SOURCEMAP_UPLOAD_DISABLED")
        exit(0)
    }

    // Parse command line arguments
    guard CommandLine.arguments.count > 2 else {
        print("Invalid Usage: Ex: Swift: upload-react-native-sourcemap.swift $INGEST_API_KEY $APP_TOKEN [--debug]")
        print("New Relic: Please provide both:")
        print("  1. Ingest API Key (from https://one.newrelic.com/api-keys)")
        print("  2. Mobile App Token (from your New Relic mobile app settings)")
        exit(1)
    }
    let apiKey = CommandLine.arguments[1]
    let appToken = CommandLine.arguments[2]

    if CommandLine.arguments.count == 4 {
        let debugFlag = CommandLine.arguments[3]
        if debugFlag == "--debug" {
            debug = true
        }
    }

    // Configure Environment Variables
    // SOURCEMAP_UPLOAD_URL (if set) takes precedence; otherwise derive from the app token's region prefix (EU/JP).
    var url: String
    if let override = environment["SOURCEMAP_UPLOAD_URL"] {
        url = override
    } else if let regionAwareURL = regionAwareURL(forAppToken: appToken) {
        url = regionAwareURL
        print("New Relic: Using region-aware URL: \(url)")
    } else {
        url = defaultURL
    }
    sourcemapEndpointPath = environment["NEWRELIC_SOURCEMAP_ENDPOINT"] ?? "v1/react-native/sourcemaps"

    // Determine source map path
    let derivedFileDir = environment["DERIVED_FILE_DIR"] ?? ""
    let sourcemapPath = environment["SOURCEMAP_PATH"] ?? "\(derivedFileDir)/main.jsbundle.map"

    if debug {
        print("========== Configuration = \(configuration)")
        print("========== Platform = \(platformName ?? "NOT FOUND")")
        print("========== Source Map Path = \(sourcemapPath)")
        print("========== URL = \(url)")
        print("========== API Key = \(apiKey.prefix(10))...")
    }

    // Check if source map exists
    guard fileManager.fileExists(atPath: sourcemapPath) else {
        print("Error: Source map not found at: \(sourcemapPath)")
        print("Make sure React Native bundling completed successfully and SOURCEMAP_OUTPUT is set.")
        print("This script should run AFTER the 'Bundle React Native code and images' build phase.")
        exit(1)
    }

    print("New Relic: Found source map at: \(sourcemapPath)")

    // Check file size
    var sourcemapFileSize: UInt64 = 0
    do {
        let attributes = try fileManager.attributesOfItem(atPath: sourcemapPath)
        if let fileSize = attributes[.size] as? UInt64 {
            sourcemapFileSize = fileSize
            let fileSizeMB = Double(fileSize) / 1024.0 / 1024.0
            print("New Relic: Source map size: \(String(format: "%.2f", fileSizeMB))MB")
        }
    } catch {
        print("Warning: Could not determine file size: \(error)")
    }

    // Extract version info from Info.plist
    guard let infoplistPath = environment["INFOPLIST_PATH"],
          let builtProductsDir = environment["BUILT_PRODUCTS_DIR"] else {
        print("Error: Could not find Info.plist path from environment")
        exit(1)
    }

    let builtInfoPlistPath = "\(builtProductsDir)/\(infoplistPath)"

    guard let infoPlist = NSDictionary(contentsOfFile: builtInfoPlistPath) else {
        print("Error: Could not read Info.plist at: \(builtInfoPlistPath)")
        exit(1)
    }

    guard let appVersion = infoPlist["CFBundleShortVersionString"] as? String else {
        print("Error: Could not read CFBundleShortVersionString from Info.plist")
        exit(1)
    }

    guard let buildNumber = infoPlist["CFBundleVersion"] as? String else {
        print("Error: Could not read CFBundleVersion from Info.plist")
        exit(1)
    }

    // jsBundleId is the same as appVersion (CFBundleShortVersionString)
    let jsBundleId = appVersion

    let sourcemapName = "main.jsbundle.map"

    print("New Relic: Upload metadata:")
    print("  App Version: \(appVersion)")
    print("  JS Bundle ID: \(jsBundleId)")
    print("  Source Map Name: \(sourcemapName)")
    if debug {
        print("  App Token: \(appToken.prefix(10))...")
    }

    // Upload source map
    let uploadURL = "\(url)/\(sourcemapEndpointPath)"

    // If the source map exceeds the 200MB limit, skip the upload entirely and send
    // telemetry metadata instead, rather than failing the build. Mirrors the Android
    // agent's oversized-source-map handling (ReactNativeSourceMap.sendTelemetryOnly).
    if sourcemapFileSize > maxFileSizeBytes {
        sendTelemetryOnly(
            apiKey: apiKey,
            appToken: appToken,
            url: uploadURL,
            jsBundleId: jsBundleId,
            appVersion: appVersion,
            sourcemapName: sourcemapName,
            sourcemapSize: sourcemapFileSize
        )
        exit(0)
    }

    print("New Relic: Uploading to: \(uploadURL)")

    do {
        try uploadSourceMap(
            apiKey: apiKey,
            appToken: appToken,
            url: uploadURL,
            sourcemapPath: sourcemapPath,
            jsBundleId: jsBundleId,
            appVersion: appVersion,
            sourcemapName: sourcemapName
        )
        print("New Relic: ✓ Source map uploaded successfully!")
        exit(0)
    } catch {
        print("Error: Source map upload failed: \(error)")
        exit(1)
    }
}

// MARK: - Helper Functions

func uploadSourceMap(
    apiKey: String,
    appToken: String,
    url: String,
    sourcemapPath: String,
    jsBundleId: String,
    appVersion: String,
    sourcemapName: String
) throws {

    guard let uploadURL = URL(string: url) else {
        throw SourceMapToolError.invalidConfiguration
    }

    // Create multipart form data
    let boundary = "Boundary-\(UUID().uuidString)"
    var request = URLRequest(url: uploadURL)
    request.httpMethod = "POST"
    request.setValue(apiKey, forHTTPHeaderField: "Api-Key")
    request.setValue(appToken, forHTTPHeaderField: "X-APP-LICENSE-KEY")
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

    var body = Data()

    // Add text fields
    let textFields = [
        "jsBundleId": jsBundleId,
        "appVersion": appVersion,
        "sourcemapName": sourcemapName
    ]

    for (key, value) in textFields {
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(value)\r\n".data(using: .utf8)!)
    }

    // Add source map file
    guard var fileData = try? Data(contentsOf: URL(fileURLWithPath: sourcemapPath)) else {
        throw SourceMapToolError.sourceMapNotFound
    }

    let maxSizeBytes = 200 * 1024 * 1024  // 200MB
    let compressionThreshold = 50 * 1024 * 1024  // Compress if > 50MB
    let originalSizeMB = Double(fileData.count) / (1024 * 1024)
    var uploadFilename = sourcemapName
    var contentType = "application/json"

    // Check if compression is needed
    if fileData.count > compressionThreshold {
        print("Source map size: \(String(format: "%.2f", originalSizeMB))MB")
        print("Compressing source map for upload...")

        // Create temporary zip file
        let tempDir = NSTemporaryDirectory()
        let zipPath = (tempDir as NSString).appendingPathComponent("sourcemap.zip")
        let sourceMapFilename = (sourcemapPath as NSString).lastPathComponent

        // Use ditto command to create zip (available on macOS)
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/ditto")
        process.arguments = ["-c", "-k", "--sequesterRsrc", "--keepParent", sourcemapPath, zipPath]

        do {
            try process.run()
            process.waitUntilExit()

            if process.terminationStatus == 0 {
                // Read compressed file
                if let compressedData = try? Data(contentsOf: URL(fileURLWithPath: zipPath)) {
                    let compressedSizeMB = Double(compressedData.count) / (1024 * 1024)
                    let compressionRatio = (1.0 - Double(compressedData.count) / Double(fileData.count)) * 100

                    print("Compressed size: \(String(format: "%.2f", compressedSizeMB))MB (\(String(format: "%.1f", compressionRatio))% reduction)")

                    // Check if compressed file is still too large
                    if compressedData.count > maxSizeBytes {
                        print("Error: Compressed source map is still too large (\(String(format: "%.2f", compressedSizeMB))MB)")
                        print("Maximum allowed size is 200MB")
                        print("Consider:")
                        print("  • Enable JavaScript minification")
                        print("  • Use code splitting or dynamic imports")
                        print("  • Switch to Hermes engine")
                        try? FileManager.default.removeItem(atPath: zipPath)
                        throw SourceMapToolError.failedToUpload
                    }

                    fileData = compressedData
                    uploadFilename = "sourcemap.zip"
                    contentType = "application/zip"

                    // Clean up temp file
                    try? FileManager.default.removeItem(atPath: zipPath)
                } else {
                    print("Warning: Failed to read compressed file, uploading uncompressed")
                }
            } else {
                print("Warning: Compression failed, uploading uncompressed")
            }
        } catch {
            print("Warning: Could not compress file (\(error)), uploading uncompressed")
        }
    }

    // Final size check for uncompressed files
    if fileData.count > maxSizeBytes {
        let sizeMB = Double(fileData.count) / (1024 * 1024)
        print("Error: Source map file is too large (\(String(format: "%.2f", sizeMB))MB)")
        print("Maximum allowed size is 200MB")
        print("Consider enabling minification or code splitting in your React Native build")
        throw SourceMapToolError.failedToUpload
    }

    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append("Content-Disposition: form-data; name=\"sourcemap\"; filename=\"\(uploadFilename)\"\r\n".data(using: .utf8)!)
    body.append("Content-Type: \(contentType)\r\n\r\n".data(using: .utf8)!)
    body.append(fileData)
    body.append("\r\n".data(using: .utf8)!)
    body.append("--\(boundary)--\r\n".data(using: .utf8)!)

    request.httpBody = body

    if debug {
        print("Request URL: \(uploadURL)")
        print("Request body size: \(body.count) bytes")
    }

    // Perform synchronous upload
    let semaphore = DispatchSemaphore(value: 0)
    var uploadError: Error?
    var httpStatusCode: Int = 0

    let task = URLSession.shared.dataTask(with: request) { data, response, error in
        defer { semaphore.signal() }

        if let error = error {
            uploadError = error
            return
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            uploadError = SourceMapToolError.failedToUpload
            return
        }

        httpStatusCode = httpResponse.statusCode

        if debug {
            print("Response status code: \(httpStatusCode)")
            if let data = data, let responseString = String(data: data, encoding: .utf8) {
                print("Response body: \(responseString)")
            }
        }

        // Parse error response if available
        var errorMessage: String?
        if let data = data,
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            errorMessage = json["message"] as? String ?? json["errorMessage"] as? String
        }

        // 409 means a source map for this jsBundleId has already been stored -- this is
        // expected/harmless (e.g. a rebuild without a version bump), not a failure.
        // Matches the Android agent's HTTP_CONFLICT handling.
        if httpStatusCode == 409 {
            print("New Relic: A source map for this build (jsBundleId: \(jsBundleId)) has already been stored.")
            return
        }

        guard (200...299).contains(httpStatusCode) else {
            print("Error: Source map upload failed (HTTP \(httpStatusCode))")

            switch httpStatusCode {
            case 400:
                print("Bad Request - Validation failed")
                if let error = errorMessage {
                    print("  \(error)")
                }
                print("Common causes:")
                print("  • Source map version must be 3")
                print("  • Missing required fields (jsBundleId, appVersion, sourcemapName)")
                print("  • Invalid JSON format")
                print("  • ZIP file issues (no valid files, multiple files, or invalid extension)")

            case 401:
                print("Unauthorized - API key and app token mismatch")
                if let error = errorMessage {
                    print("  \(error)")
                }
                print("The API key is valid, but the app token belongs to a different account.")
                print("Ensure both are from the same New Relic account.")

            case 403:
                print("Forbidden - API key lacks required capability")
                if let error = errorMessage {
                    print("  \(error)")
                }
                print("Check your New Relic Ingest API Key at https://one.newrelic.com/api-keys")

            case 404:
                print("Not Found - Invalid app token")
                if let error = errorMessage {
                    print("  \(error)")
                }
                print("The X-APP-LICENSE-KEY (app token) doesn't exist.")
                print("Verify your app token in the New Relic mobile app settings.")

            case 413:
                print("Payload Too Large - File exceeds size limit")
                if let error = errorMessage {
                    print("  \(error)")
                }
                print("The source map file exceeds 200MB (zipped or unzipped).")
                print("Consider:")
                print("  • Enable JavaScript minification")
                print("  • Use code splitting or dynamic imports")
                print("  • Switch to Hermes engine (produces smaller bundles)")

            case 500...599:
                print("Internal Server Error - Server-side issue")
                if let error = errorMessage {
                    print("  \(error)")
                }
                print("An unexpected error occurred on the server.")
                print("Check upload_sourcemap_results.log and try again.")

            default:
                if let error = errorMessage {
                    print("  \(error)")
                }
            }

            // Always print full response body in debug mode
            if let data = data, let responseString = String(data: data, encoding: .utf8) {
                if debug {
                    print("Full response body: \(responseString)")
                }
            }

            uploadError = SourceMapToolError.failedToUpload
            return
        }

        // Success - Parse and display metadata
        if httpStatusCode == 201, let data = data,
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let metadata = json["sourcemapMetaData"] as? [String: Any] {
            print("✅ Source map uploaded successfully!")
            if let entityGuid = metadata["entityGuid"] as? String {
                print("  Entity GUID: \(entityGuid)")
            }
            if let accountId = metadata["accountId"] {
                print("  Account ID: \(accountId)")
            }
            if let appId = metadata["applicationId"] {
                print("  Application ID: \(appId)")
            }
            if let jsBundleId = metadata["JSBundleId"] as? String {
                print("  JS Bundle ID: \(jsBundleId)")
            }
            if let appVersion = metadata["appVersion"] as? String {
                print("  App Version: \(appVersion)")
            }
            if let createdAt = metadata["createdAt"] as? String {
                print("  Created At: \(createdAt)")
            }
        } else {
            print("✅ Source map uploaded successfully (HTTP \(httpStatusCode))")
        }
    }

    task.resume()
    semaphore.wait()

    if let error = uploadError {
        throw error
    }
}

// Sends telemetry metadata instead of the actual source map when the map exceeds the
// 200MB limit. No file body is included -- the x-telemetry-data header (Base64-encoded
// JSON) is the payload. A non-2xx response is expected (there's no file for the server
// to validate) and is logged, not treated as a failure -- this function never throws,
// mirroring the Android agent's non-fatal telemetry send (ReactNativeSourceMap.sendTelemetryOnly).
func sendTelemetryOnly(
    apiKey: String,
    appToken: String,
    url: String,
    jsBundleId: String,
    appVersion: String,
    sourcemapName: String,
    sourcemapSize: UInt64
) {
    print("New Relic: Source map exceeds 200MB limit. Sending telemetry data instead of the file.")

    let bundlePath = "\(environment["BUILT_PRODUCTS_DIR"] ?? "")/main.jsbundle"
    var bundleSize: UInt64 = 0
    if let attributes = try? fileManager.attributesOfItem(atPath: bundlePath),
       let size = attributes[.size] as? UInt64 {
        bundleSize = size
    }
    let bundleName = sourcemapName.replacingOccurrences(of: ".map", with: "")

    let telemetryJSON = "{\"bundler\":\"metro\",\"bundles\":[{\"name\":\"\(bundleName)\",\"size\":\(bundleSize)}],"
        + "\"sourcemaps\":[{\"name\":\"\(sourcemapName)\",\"size\":\(sourcemapSize)}]}"
    let encodedTelemetry = Data(telemetryJSON.utf8).base64EncodedString()

    if debug {
        print("========== Telemetry JSON = \(telemetryJSON)")
    }

    guard let telemetryURL = URL(string: url) else {
        print("Warning: Could not build telemetry request URL (non-critical).")
        print("New Relic: JavaScript errors for this build will not be symbolicated.")
        return
    }

    let boundary = "Boundary-\(UUID().uuidString)"
    var request = URLRequest(url: telemetryURL)
    request.httpMethod = "POST"
    request.setValue(apiKey, forHTTPHeaderField: "Api-Key")
    request.setValue(appToken, forHTTPHeaderField: "X-APP-LICENSE-KEY")
    request.setValue(encodedTelemetry, forHTTPHeaderField: telemetryDataHeader)
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

    var body = Data()
    let textFields = [
        "jsBundleId": jsBundleId,
        "appVersion": appVersion,
        "sourcemapName": sourcemapName
    ]
    for (key, value) in textFields {
        body.append("--\(boundary)\r\n")
        body.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n")
        body.append("\(value)\r\n")
    }
    body.append("--\(boundary)--\r\n")
    request.httpBody = body

    let semaphore = DispatchSemaphore(value: 0)
    let task = URLSession.shared.dataTask(with: request) { data, response, error in
        defer { semaphore.signal() }

        if let error = error {
            print("Note: Telemetry send encountered an error (non-critical): \(error.localizedDescription)")
            return
        }
        guard let httpResponse = response as? HTTPURLResponse else { return }
        // A non-2xx response is expected here since no source map file is attached --
        // the telemetry header is the payload, not the response status.
        print("New Relic: Telemetry data sent (server returned \(httpResponse.statusCode)).")
        if debug, let data = data, let responseString = String(data: data, encoding: .utf8) {
            print("Response body: \(responseString)")
        }
    }
    task.resume()
    semaphore.wait()

    print("New Relic: New Relic currently supports source map files up to 200MB. The source map for this build exceeds that limit.")
    print("New Relic: JavaScript errors for this build will not be symbolicated.")
}

// MARK: - Region Parsing

// Parses a region prefix (e.g. "eu01", "jp01") from a New Relic app token.
// The token format is "<region>x...x<key>". Returns nil if no region prefix is present (US).
func parseRegionFromAppToken(_ token: String) -> String? {
    let range = NSRange(location: 0, length: token.utf16.count)
    guard let regex = try? NSRegularExpression(pattern: "^.+?x"),
          let match = regex.firstMatch(in: token, options: [], range: range),
          let swiftRange = Range(match.range, in: token) else {
        return nil
    }
    let raw = String(token[swiftRange])
    guard let lastNonX = raw.lastIndex(where: { $0 != "x" }) else {
        return nil
    }
    let trimmed = String(raw[...lastNonX])
    return trimmed.isEmpty ? nil : trimmed
}

// Maps a parsed region prefix to the symbol-ingest-api host.
// e.g. "eu01" -> https://symbol-ingest-api.service.eu.newrelic.com
//      "jp01" -> https://symbol-ingest-api.service.jp.newrelic.com
// The region family is the prefix stripped of trailing digits (eu01 -> eu).
func regionAwareURL(forAppToken token: String) -> String? {
    guard let region = parseRegionFromAppToken(token) else { return nil }
    var regionFamily = region.lowercased()
    while let last = regionFamily.last, last.isNumber {
        regionFamily.removeLast()
    }
    guard !regionFamily.isEmpty else { return nil }
    return "https://symbol-ingest-api.service.\(regionFamily).newrelic.com"
}

// MARK: - Extensions

extension Data {
    mutating func append(_ string: String) {
        if let data = string.data(using: .utf8) {
            append(data)
        }
    }
}
