# 🚀 How to Push a Silent OTA Update

Follow these 3 simple steps to update your app without users needing to reinstall.

### Step 1: Make Your Changes

Edit your **JavaScript / TypeScript / CSS** files normally.
_(Note: If you add new native plugins, you MUST rebuild the APK manually instead.)_

### Step 2: Bump Versions

You must increase the version number so the app detects the change.

**1. Update `apps/core/src/version.ts`:**

```typescript
export const CURRENT_VERSION = "1.0.3"; // Increment this!
```

**2. Update `apps/landing/public/version.json`:**

```json
{
  "latestVersion": "1.0.3",
  "minSupportedVersion": "1.0.0",
  "changelog": "Description of your changes here...",
  "apkUrl": "/mindspace.apk",
  "zipUrl": "/dist.zip"
}
```

### Step 3: Deploy

Run the deployment script from your project root:

**Windows:**

```cmd
.\deploy.bat
```

**Mac/Linux:**

```bash
./deploy.sh
```

---

** that's it!**
The script will:

1.  Zip your new code.
2.  Push it to GitHub.
3.  Vercel will publish it.
4.  Your users' apps will update automatically in the background!
