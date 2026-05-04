# GitHub Actions - Automated APK Release Setup

This guide explains how to use the GitHub Actions workflows to automatically build and release APKs.

## 📋 Overview

Two workflows are included:

1. **build-apk.yml** - Builds unsigned release APKs (currently active)
2. **build-signed-apk.yml** - Template for signed releases (requires setup)

## ✅ Current Setup (Unsigned Builds)

The **build-apk.yml** workflow is ready to use immediately. It:

- ✅ Triggers on every push to `main` or `master` branch
- ✅ Sets up Flutter environment automatically
- ✅ Builds release APK
- ✅ Uploads APK as GitHub artifact (30 days retention)
- ✅ Creates automatic GitHub releases with APK attached

### Usage

1. Push code to `main` or `master`:
   ```bash
   git push origin main
   ```

2. Navigate to **Actions** tab on GitHub to see build progress

3. Once complete, the APK is available as:
   - **Release artifact** - Download from GitHub Releases
   - **Build artifact** - Download from Actions run summary

## 🔒 Setup for Signed Releases (Google Play Store)

To distribute on Google Play Store, you need a **signed APK**. Follow these steps:

### Step 1: Generate a Keystore (Local Machine)

```bash
keytool -genkey -v -keystore release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my_key_alias
```

This creates `release-key.keystore` in your current directory. You'll be prompted for:
- Keystore password (e.g., `myKeystorePassword123`)
- Key password (e.g., `myKeyPassword123`)
- Key alias (e.g., `my_key_alias`)
- Your information (name, organization, etc.)

**⚠️ IMPORTANT:** Save this keystore file securely. You cannot recreate it!

### Step 2: Encode Keystore as Base64

```bash
base64 -i release-key.keystore
```

This outputs a long base64 string. Copy the entire output.

### Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret" for each:

| Secret Name | Value |
|---|---|
| `KEYSTORE_BASE64` | Base64-encoded keystore (from Step 2) |
| `KEYSTORE_PASSWORD` | Keystore password from Step 1 |
| `KEY_ALIAS` | Key alias from Step 1 |
| `KEY_PASSWORD` | Key password from Step 1 |

**Example:**
- KEYSTORE_PASSWORD: `myKeystorePassword123`
- KEY_ALIAS: `my_key_alias`
- KEY_PASSWORD: `myKeyPassword123`

### Step 4: Enable Signed Build Workflow

1. Rename `.github/workflows/build-signed-apk.yml` by uncommenting it
   - OR create a new workflow file with the signed build configuration

2. Update the workflow file to uncomment the workflow definition

3. Push to repository

```bash
git add .github/workflows/
git commit -m "Enable signed APK builds"
git push
```

### Step 5: Verify

- Go to **Actions** tab
- Check that both workflows run successfully
- Download the signed APK from releases

## 📦 Artifact Management

### Unsigned Builds (Current)
- **Location**: GitHub Actions → Artifacts (30-day retention)
- **Release Tag**: `v{run_number}` (auto-generated)
- **Suitable for**: Testing, beta releases, internal distribution

### Signed Builds (When Enabled)
- **Location**: GitHub Releases (permanent)
- **Release Tag**: Git tags (e.g., `v1.0.0`)
- **Suitable for**: Google Play Store, production releases

## 🚀 Workflow Triggers

The workflows trigger automatically on:

1. **Push to main/master branch**
   ```bash
   git push origin main
   ```

2. **Manual trigger**
   - Go to Actions → Select workflow → Run workflow

3. **Tagged releases** (if using signed workflow)
   ```bash
   git tag v1.0.0
   git push --tags
   ```

## 📊 Monitoring Builds

1. Go to **Actions** tab on GitHub
2. Click on the workflow run to see:
   - Build logs
   - Status (✅ Success or ❌ Failed)
   - Artifacts generated
   - Build duration

## ⚠️ Common Issues

### Build Fails with "Flutter not found"
- The workflow automatically installs Flutter
- Check if any custom Flutter version is needed in `pubspec.yaml`

### APK Size Too Large
- Both workflows enable minification (`isMinifyEnabled = true`)
- Reduce asset size if needed

### Cannot Create Release
- Ensure `GITHUB_TOKEN` secret exists (it does by default)
- Check repository permissions

## 🔐 Security Best Practices

1. **Never commit keystore files to git**
   - Add to `.gitignore`:
     ```
     android/key.properties
     android/app/release-key.keystore
     ```

2. **Never commit `key.properties` with real values**
   - Use GitHub Secrets for CI/CD

3. **Rotate keystore passwords periodically**

4. **Limit secret access** to necessary workflows only

## 📝 Example Workflow

```
Code Push → GitHub Actions Triggered
          → Flutter Setup
          → Dependencies Install
          → APK Build
          → Upload Artifacts
          → Create Release
          → ✅ Done (Notifications sent if configured)
```

## 🆘 Troubleshooting

### Workflow file not detected
```bash
# Ensure .github/workflows/ directory exists
ls -la .github/workflows/
```

### Build hangs or times out
- Default timeout is 6 hours
- Check for network issues or large dependencies

### Release already exists error
- Increment version in `pubspec.yaml` before pushing
- Or manually delete old releases

## 📚 Additional Resources

- [Flutter Build Documentation](https://flutter.dev/docs/deployment/android)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Android App Signing Guide](https://developer.android.com/studio/publish/app-signing)

---

**Next Steps:**
1. Test the current unsigned build workflow
2. Once verified, follow steps to enable signed releases
3. Set up Google Play Store release process
