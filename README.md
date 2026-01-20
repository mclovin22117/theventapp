The Vent
This is a simple, anonymous thought-sharing app built for a small community.

> **⚠️ Important Notice**
> 
> This app requires Firebase to function. If you want to build and run this app yourself, you **must**:
> 1. Create your own Firebase project at [Firebase Console](https://console.firebase.google.com/)
> 2. Enable **Email/Password Authentication** in Firebase Console
> 3. Enable **Firestore Database** in Firebase Console
> 4. Enable **App Check** with reCAPTCHA v3 (for web)
> 5. Replace the Firebase configuration in `firebaseConfig.js` with your own Firebase project credentials
> 6. Update the Firestore security rules in Firebase Console using the `firestore.rules` file
> 
> **The current Firebase configuration in this repository is for the production app and should NOT be used for your own deployments.**

## � Screenshots

<div align="center">
  <img src="screenshots/home.png" alt="Home Feed" width="250"/>
  <img src="screenshots/post.png" alt="Create Post" width="250"/>
  <img src="screenshots/details.png" alt="Post Details" width="250"/>
</div>

**Key Features Shown:**
- **Anonymous Feed**: Browse thoughts shared by the community with WhatsApp-style interface
- **Easy Posting**: Share your thoughts with category tags
- **Engage & Reply**: Like and comment on posts anonymously

---

## �📱 Download & Install

### For Android Users:
1. **Download the APK**: Go to the [Releases](https://github.com/reetik-rana/theventapp/releases) page
2. **Find the latest release** and download the `.apk` file
3. **Install the APK**:
   - Open the downloaded APK file on your Android device
   - If prompted, enable "Install from Unknown Sources" in your device settings
   - Follow the on-screen instructions to complete the installation
   
> **Note**: You may need to allow installation from unknown sources in your device settings. This is safe as the APK is built directly from this project.

### System Requirements:
- Android 5.0 (Lollipop) or higher
- Internet connection for authentication and posting

---

## -- Our Mission --
The Vent provides a space for users to share their thoughts, feelings, and opinions openly and honestly, without the pressure of a public identity. Our goal is to foster a supportive environment where authenticity is encouraged.

-- Key Features --
Pseudo-Anonymous Posting: Share your thoughts using a custom username(don't include your real name) and an anonymous emoji. Other users cannot see your real name or personal information.

Simple & Secure: A straightforward interface for posting and replying to thoughts. The app is built using modern technologies to ensure a smooth and secure experience.

Like & Reply: Engage with posts by liking them or adding your own anonymous replies.

-- Technical Details & Anonymity --
User Authentication: The app uses Google authentication to create a user account, which is linked to a unique User ID (UID) in our backend database.

Data Storage: When a post is created, it is associated with your unique User ID in the backend.

Transparency: While your identity is kept private from other users, anyone with administrative access to the app's backend can view a post's User ID and link it to the corresponding user account. We do not use this information to track or identify individual users.

---

## 🔧 How to Contribute
If you're interested in contributing to the project, feel free to give your feedback and suggestions.

## 📦 Building from Source
If you'd like to build the app yourself:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/reetik-rana/theventapp.git
   cd theventapp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build for Android**:
   ```bash
   npm run android:build
   # or
   eas build --platform android
   ```

4. **Run in development**:
   ```bash
   npx expo start
   ```