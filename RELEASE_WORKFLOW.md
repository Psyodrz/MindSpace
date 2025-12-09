# MindSpace App Release & Update Workflow

This document outlines the step-by-step process for releasing a new version of the MindSpace app and pushing an Over-The-Air (OTA) update to existing users.

## Prerequisites

- [ ] You have made your code changes and tested them locally.
- [ ] You have Android Studio installed and configured.

## Step 1: Update Version Numbers

Before building, you must increment the version number so the app knows an update is available.

1.  **App Version**: Open `apps/core/src/version.ts` and increment `CURRENT_VERSION` (e.g., change `'1.0.0'` to `'1.0.1'`).
2.  **Manifest Version**: Open `apps/landing/public/version.json` and update:
    - `latestVersion`: Match the new version (e.g., `"1.0.1"`).
    - `changelog`: Add a brief description of what changed.

## Step 2: Build the Core App

You need to compile the React code and sync it to the Android project.

1.  Open your terminal in `apps/core`.
2.  Run the build command:
    ```bash
    npm run build
    ```
3.  Sync with Capacitor:
    ```bash
    npx cap sync android
    ```

## Step 3: Build the Android APK

1.  Open **Android Studio**.
2.  Open the `apps/core/android` folder as your project.
3.  In Android Studio, verify the `versionName` in `app/build.gradle` matches your new version (optional but recommended).
4.  Go to **Build > Generate Signed Bundle / APK**.
5.  Select **APK**.
6.  Choose your keystore (key.jks) and enter passwords.
7.  Select **release** build variant and finish.
8.  Locate the built APK (usually in `android/app/release/app-release.apk`).

## Step 4: Publish the Update

Now you need to make the new APK available to users.

1.  **Copy APK**: Copy your newly generated `app-release.apk`.
2.  **Paste & Rename**: Paste it into `apps/landing/public/` and rename it to `mindspace.apk` (replace the existing file).
3.  **Verify**: Ensure `apps/landing/public/version.json` is saved with the new version info.

## Step 5: Deploy

Push everything to GitHub to make the update live on the website.

1.  Go to the project root.
2.  Run the deploy script:
    ```bash
    .\deploy.bat
    ```
3.  Wait for Vercel to finish the deployment.

## Conclusion

Once Vercel deploys:

- **New Users**: Will download the latest APK from the site.
- **Existing Users**: Next time they open the app, it will compare their local version (e.g., 1.0.0) with the online version (1.0.1), see the difference, and prompt them to update!
