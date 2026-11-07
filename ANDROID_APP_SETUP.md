# The Saviour Android App Setup

This adds Capacitor to the existing React frontend. It does not publish the app to Google Play automatically.

## Requirements
- Windows 10/11
- Node.js 20 or newer
- Android Studio (install its Android SDK and accept the SDK licenses)
- Java 17 (Android Studio's bundled JDK is usually suitable)
- Internet access

## 1. Get the Android wrapper branch
Clone the repository, then switch to:
`feature/android-capacitor-wrapper`

## 2. Configure the API URL
In the `frontend` directory, create a file named `.env.production` with this line:

```env
REACT_APP_API_URL=https://the-saviour-backend-dfie.onrender.com/api
```

This is the public API base URL, not a secret. Never put passwords, JWT secrets, database credentials, or private provider API keys in frontend environment variables.

## 3. Install dependencies and create the Android project
Open Command Prompt in the repository's `frontend` folder and run:

```cmd
npm install
npx cap add android
npm run android:sync
npx cap open android
```

If `npx cap add android` says the Android platform already exists, continue with `npm run android:sync`.

## 4. Build and test on a phone
In Android Studio:
1. Wait for Gradle sync to finish.
2. Connect an Android phone with USB debugging enabled, or create an Android emulator.
3. Press Run ▶ to install and test the app.

Test registration/login, dashboard, API connectivity, health records, hospital finder, microphone permissions, and navigation. The app requires an internet connection for the deployed backend.

## 5. Create a Play Store bundle
In Android Studio, use **Build → Generate Signed Bundle / APK → Android App Bundle**. Create and safely back up a signing key. Choose the release variant and generate the `.aab` file.

Do not share your signing key or passwords. Upload the AAB to Google Play Console, complete the store listing, data safety and health-app declarations, testing requirements, and submit it for review. Google must approve publication before it appears on the Play Store.

## Important
- This branch only prepares the React project for Android packaging; it is not yet a tested, signed, or published app.
- Health apps must provide accurate privacy disclosures and comply with Google Play health and user-data policies.
- Re-test browser-only features such as speech recognition on Android; Capacitor packaging does not guarantee every Web API works identically.
