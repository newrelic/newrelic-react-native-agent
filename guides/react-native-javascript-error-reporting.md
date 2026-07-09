# React Native JavaScript error reporting

By default, the New Relic React Native agent captures JavaScript errors and unhandled promise rejections and reports them as [`MobileJSError` events](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile/mobile-sdk/record-errors/#react). You can view these errors in the mobile monitoring UI, query them with NRQL, and chart them in dashboards.

To make the stack traces in `MobileJSError` events human-readable, the agent needs the source map that corresponds to the JavaScript bundle running in your app. When your New Relic User API key and application token are configured correctly, the agent uploads the source map for you automatically after each build. If you can't upload automatically, or you ship JavaScript-only updates with CodePush or another over-the-air (OTA) service, you can upload source maps manually.

> [!IMPORTANT]
> Source map upload uses a [User API key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#user-key). The User API key and the application token must belong to the same New Relic account.

> [!TIP]
> JavaScript error reporting is enabled by default. You can toggle it with the `jsErrorReportingEnabled` [configuration setting](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile/mobile-sdk/configure-settings/#react).

## Set up automatic source map upload

To upload source maps automatically, provide your New Relic User API key and application token. Because a React Native app builds separately for each platform, you configure the key differently on Android and iOS. Set it up for each platform you ship.

Before you begin, get the following from the same New Relic account:

* A [User API key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#user-key).
* Your mobile [application token](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile/maintenance/viewing-your-application-token) (the same token you pass to `NewRelic.startAgent()`).

### Android

Add your User API key to the `newrelic.properties` file in your project:

```properties
apiKey=<YOUR_USER_API_KEY>
```

Replace `<YOUR_USER_API_KEY>` with your User API key. The agent already knows the application token from `NewRelic.startAgent()`. When both values are valid, the agent generates and uploads the Android source map to New Relic automatically after each release build.

### iOS

On iOS, the source map is uploaded by a build-phase script (`upload-react-native-sourcemap`) included in the `dsym-upload-tools` folder — the same folder used for [dSYM uploads](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile-ios/configuration/upload-dsyms-bitcode-apps). You pass the User API key and application token as arguments to that script.

1. If you haven't already set up dSYM uploads, copy the `dsym-upload-tools` folder into your project's `SRCROOT` (typically your `ios` folder).
2. In Xcode, select your target, open the **Build Phases** tab, and add a **New Run Script Build Phase**. Drag it to run **after** the "Bundle React Native code and images" phase.
3. Add the following to the run script, replacing the placeholders with your User API key and application token:

   ```bash
   ARTIFACT_DIR="${BUILD_DIR%Build/*}"
   SCRIPT=`/usr/bin/find "${SRCROOT}" "${ARTIFACT_DIR}" -type f -name upload-react-native-sourcemap | head -n 1`
   /bin/sh "${SCRIPT}" "YOUR_USER_API_KEY" "YOUR_APP_TOKEN"
   ```

> [!TIP]
> Don't commit credentials to version control. Store the User API key and application token in an `.xcconfig` file or your CI/CD system's secrets, then reference them in the run script (for example, `"${NR_USER_API_KEY}" "${NR_APP_TOKEN}"`). Add `--debug` as a third argument to write verbose output to `upload_sourcemap_results.log`.

The iOS script runs only for **Release** builds and skips simulator builds. If either value is missing or invalid, the source map won't be uploaded and JavaScript error stack traces will remain unsymbolicated. In that case, [upload the source map manually](#manually-upload-a-source-map).

## Manually upload a source map

You can upload a source map directly to the New Relic source map ingest API. This is useful when automatic upload isn't possible, or when you release JavaScript-only updates through [CodePush or other OTA services](#upload-source-maps-for-codepush-and-ota-updates).

Use the following **cURL** template:

```bash
curl -X POST "https://symbol-ingest-api.newrelic.com/v1/react-native/sourcemaps" \
     -H "Api-Key: $NR_USER_API_KEY" \
     -H "X-APP-LICENSE-KEY: $NR_APP_TOKEN" \
     -F "sourcemap=@./index.android.bundle.map" \
     -F "jsBundleId=<JS_BUNDLE_ID>" \
     -F "appVersionId=1.0.5" \
     -F "sourcemapName=index.android.bundle.map"
```

Replace the following:

* `$NR_USER_API_KEY` is a valid New Relic [User API key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#user-key).
* `$NR_APP_TOKEN` is your mobile monitoring [application token](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-mobile/maintenance/viewing-your-application-token).
* `<JS_BUNDLE_ID>` is the unique build identifier reported by the agent for the JavaScript session (see [Retrieve the jsBundleId](#retrieve-the-jsbundleid)).
* `appVersionId` is the native application version the bundle targets (for example, `1.0.5`).

> [!TIP]
> For accounts on New Relic's **EU data center**, use the EU endpoint instead: `https://symbol-ingest-api.eu01.nr-data.net/v1/react-native/sourcemaps`.

### Upload API reference

**Endpoint**

| Property | Value |
| :--- | :--- |
| Method | `POST` |
| URL | `https://symbol-ingest-api.newrelic.com/v1/react-native/sourcemaps` |
| Content-Type | `multipart/form-data` |

**Headers**

| Header | Required | Description |
| :--- | :--- | :--- |
| `Api-Key` | Yes | A valid New Relic [User API key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#user-key). It must belong to the same account as the application token. |
| `X-APP-LICENSE-KEY` | Yes | The application token for the mobile app. |
| `X-Telemetry-Data` | No | Telemetry information about the bundler, source map names, and sizes. When a source map exceeds 200 MB, the agent doesn't send the file and instead transmits this header only. |
| `Content-Type` | Yes | Must be `multipart/form-data`. |

**Request body (multipart form data)**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sourcemap` | File | No | The source map file (`.map` or `.bundle`). Can be gzipped. Maximum 200 MB (see [File size limitations](#file-size-limitations)). |
| `sourcemapName` | String | No | Name of the source map file. Maximum 255 characters. |
| `jsBundleId` | String | Yes | Unique build identifier (for example, a SHA or ID). Maximum 255 characters. |
| `appVersionId` | String | Yes | Application version (for example, `1.5.2`). Maximum 255 characters. |

> [!IMPORTANT]
> If the source map file exceeds 200 MB after zipping, the agent won't send the file. Instead, it transmits the `X-Telemetry-Data` header so New Relic can still track that a build occurred. For details, see [File size limitations](#file-size-limitations).

**Responses**

Responses use `Content-Type: application/json`.

| HTTP status | Description |
| :--- | :--- |
| `201 Created` | The source map was uploaded successfully. The response body contains the source map metadata (see the example below). |
| `400 Bad Request` | Validation failed, for example missing fields, an invalid JSON schema in the file, or a malformed request. Example: `{"message": "Validation failed: Source map version must be 3."}` |
| `401 Unauthorized` | The API key is valid, but the `X-APP-LICENSE-KEY` belongs to a different account (cross-account protection). Example: `{"message": "User not authorized"}` |
| `403 Forbidden` | The `Api-Key` doesn't have the required capability. Make sure your User API key belongs to a user with permission to upload symbols. Example: `{"message": "User not authorized"}` |
| `404 Not Found` | The application token provided in the header doesn't exist. Example: `{"message": "applicationToken is invalid"}` |
| `413 Payload Too Large` | The zipped or unzipped source map file exceeds 200 MB. Example: `{"message": "Sourcemap file is too large"}` |
| `500 Internal Server Error` | A generic, unrecoverable error occurred on the server side. Example: `{"message": "Unexpected error occured during upload process because of {error}"}` |

Example `201 Created` response body:

```json
{
  "sourcemapMetaData": {
    "entityGuid": "MTE3NjI3MzJ8TkdFUHxTQU5EQk9YX0JMT0J8MDE5YWM0ZGMtZmJiNy03OGZjLWI5ZjctOGZiNTgzZGViNmQ5",
    "accountId": 11762732,
    "applicationId": 232149631,
    "sourcemapName": "app.min.js.map",
    "appVersionId": "12424",
    "JSBundleId": "87124712",
    "createdAt": "2025-11-27T10:32:44.586Z"
  }
}
```

## Upload source maps for CodePush and OTA updates

When you use CodePush or another OTA update service, the JavaScript bundle version diverges from the native binary version. Each time you push a JavaScript update, upload the new source map so that `MobileJSError` events remain readable in New Relic.

To symbolicate an OTA update, the upload must use:

* A unique `jsBundleId` that matches the ID the agent reports during the JavaScript session.
* The correct `appVersionId`, which is the native version the bundle targets.

You can upload the source map with a script in your CI/CD pipeline or manually with cURL.

### Method 1: Automated upload via script

New Relic provides a Node.js helper script that you can run in your CI/CD pipeline immediately after the `appcenter codepush release-react` command.

```bash
# Example integration
appcenter codepush release-react -a <Owner>/<App>
node upload-nr-sourcemap.js --bundle android/index.android.bundle --map android/index.android.bundle.map --bundleId <NEW_ID>
```

### Method 2: Manual upload via cURL

If you prefer not to use the script, upload the source map to the source map ingest API with cURL:

```bash
curl -X POST "https://symbol-ingest-api.newrelic.com/v1/react-native/sourcemaps" \
     -H "Api-Key: $NR_USER_API_KEY" \
     -H "X-APP-LICENSE-KEY: $NR_APP_TOKEN" \
     -F "sourcemap=@./index.android.bundle.map" \
     -F "jsBundleId=CODE_PUSH_ID_HERE" \
     -F "appVersionId=1.0.5" \
     -F "sourcemapName=index.android.bundle.map"
```

For the full list of headers, body fields, and responses, see the [upload API reference](#upload-api-reference).

### Retrieve the jsBundleId

The `jsBundleId` used for the upload must match the bundle ID the agent reports for the JavaScript session. For CodePush releases, use the CodePush deployment or release identifier as the `jsBundleId` so the uploaded source map maps to the bundle running in your users' apps.

> [!TIP]
> To verify, audit, or remove source maps you've uploaded, see [List and delete React Native source maps](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-monitoring-react-native/list-delete-react-native-source-maps).

## File size limitations

Source map files must be under **200 MB after zipping** to be stored for symbolication.

Our build scripts automatically zip the `.map` file before upload. If the resulting `.zip` archive exceeds 200 MB, the file is **not** uploaded, which prevents build timeouts and ingestion errors.

In these cases, the script sends build telemetry (metadata) instead of the file. This lets New Relic track that a build occurred, even though symbolication isn't available for that specific version. As a result, `MobileJSError` events for that build show unsymbolicated (minified) stack traces.

If your source map is larger than 200 MB after zipping, [reach out to New Relic Support or file a feature request](#request-support-for-large-source-maps). There's currently no way to raise this limit yourself.

## Troubleshoot source map uploads

If your `MobileJSError` stack traces aren't symbolicated, your source map may have exceeded the [200 MB size limit](#file-size-limitations). Use the following steps to confirm the cause and request help. For more troubleshooting tips and frequently asked questions, see [Troubleshoot React Native source maps and JavaScript errors](https://docs.newrelic.com/docs/mobile-monitoring/new-relic-monitoring-react-native/troubleshoot-react-native-source-maps).

### Confirm whether the file or telemetry was uploaded

A successful build doesn't always mean a successful file upload. If your build script completes with a `Success` message but your source map is larger than 200 MB, check your console logs. You'll see a message indicating that telemetry was sent instead of the source map file.

### Check the zip size

Manually zip your source map and check the archive size to verify whether you're near or over the limit:

```bash
# Zip the source map, then check the archive size
zip -q sourcemap.zip index.android.bundle.map
ls -lh sourcemap.zip
```

If the archive is near or above 200 MB, the source map can't be uploaded for symbolication.

### Request support for large source maps

If your zipped source map exceeds the 200 MB limit, there's no way to reduce it on your side or raise the limit yourself. To let us know this is affecting you and to track progress on larger source map support:

* [Contact New Relic Support](https://support.newrelic.com/).
* File a feature request so we can prioritize raising the source map size limit.
