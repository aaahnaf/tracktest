# Building Android APK

This document explains how to build the Android APK for "What Did I Spend?" using GitHub Actions.

## Automatic Build (GitHub Actions)

The app is configured to automatically build an Android APK when you push to the `main` or `master` branch.

### Steps:
1. Push your code to GitHub
2. Go to the "Actions" tab in your repository
3. Wait for the "Build Android APK" workflow to complete
4. Download the APK from the workflow artifacts

### Triggering a Build:
- Push to `main` or `master` branch
- Create a pull request to `main` or `master`
- Manually trigger from Actions tab (workflow_dispatch)

## Manual Build (Local)

If you want to build the APK locally:

### Prerequisites:
- Node.js 18+
- Android Studio
- Java 17

### Steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the web app:**
   ```bash
   npm run build
   ```

3. **Sync with Capacitor:**
   ```bash
   npx cap sync android
   ```

4. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

5. **Build APK in Android Studio:**
   - Click "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"
   - Or run: `cd android && ./gradlew assembleDebug`

6. **Find the APK:**
   - Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Release APK: `android/app/build/outputs/apk/release/app-release.apk`

## Using npm Scripts

The project includes convenient npm scripts:

```bash
# Build web app and sync with Android
npm run android:build

# Sync Capacitor only
npm run cap:sync

# Open Android Studio
npm run cap:android
```

## Signed Release APK

For a signed release APK:

1. **Generate a keystore:**
   ```bash
   keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
   ```

2. **Update `android/app/build.gradle`:**
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('../release-key.jks')
               storePassword 'your-store-password'
               keyAlias 'my-key-alias'
               keyPassword 'your-key-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Build release APK:**
   ```bash
   cd android && ./gradlew assembleRelease
   ```

## GitHub Actions with Signed APK

To build signed APKs in GitHub Actions:

1. **Add secrets to your repository:**
   - `KEYSTORE_FILE`: Base64 encoded keystore file
   - `KEYSTORE_PASSWORD`: Keystore password
   - `KEY_ALIAS`: Key alias
   - `KEY_PASSWORD`: Key password

2. **Update the workflow** to use these secrets (advanced setup required)

## Troubleshooting

### Build fails with "SDK location not found"
- Set `ANDROID_HOME` environment variable
- Or create `android/local.properties` with: `sdk.dir=/path/to/android/sdk`

### Gradle build fails
- Ensure Java 17 is installed: `java -version`
- Update Gradle wrapper: `cd android && ./gradlew wrapper --gradle-version 8.2.1`

### Capacitor sync fails
- Delete `android` folder and re-run: `npx cap add android`
- Ensure `dist` folder exists (run `npm run build` first)

## App Configuration

The app is configured in `capacitor.config.ts`:
- **App ID:** `com.whatdidispending.app`
- **App Name:** `What Did I Spend?`
- **Web Directory:** `dist`

To change these, edit `capacitor.config.ts` and re-sync.

## Next Steps

After building the APK:
1. Test on a physical device or emulator
2. For Play Store release, create a signed release APK
3. Follow Google Play Store submission guidelines
4. Create app icons in various sizes (see Android icon guidelines)
