# Project will undergo switch from SUPABASE to Firebase due to Indian government's recent It law changes.
## The app/web won't work for now. 
<div align="center">
  <img src="assets/images/logo.png" alt="TheVent Logo" width="100" height="100" />
  <h1>TheVent</h1>
  <p><em>Speak freely. Anonymously.</em></p>

  ![Flutter](https://img.shields.io/badge/Flutter-3.41.3-blue?logo=flutter)
  ![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)
  ![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-lightgrey)
  ![License](https://img.shields.io/badge/License-MIT-purple)
</div>

---

## 📖 What is TheVent?

**TheVent** is an open-source, anonymous social platform where users can freely express their thoughts, feelings, and frustrations without fear of judgment.

Built with **Flutter** (for Android, iOS & Web) and powered by **Supabase** as the backend.

---

## ✨ Features

- 🔐 **Anonymous Auth** — Register & login with just a username and password. No email. No phone number.
- 🏠 **Home Feed** — Browse everyone's vents in real time.
- ✍️ **Post a Vent** — Share what's on your mind (up to 500 characters).
- ❤️ **Likes** — One like per user per vent.
- 💬 **Replies** — Reply to any vent anonymously.
- 👤 **Profile** — Upload, replace or remove your profile picture.
- 🌑 **Dark Mode Only** — Easy on the eyes.
- 📱 **Cross Platform** — Runs on Android, iOS and Web from a single codebase.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter 3.x |
| Language | Dart |
| Backend | Supabase (Database + Storage + Auth) |
| Navigation | Flutter Navigator 2.0 |
| Image Picker | image_picker |
| Local Storage | shared_preferences |

---

## 🚀 Getting Started (Install & Run)

### Prerequisites

Make sure you have the following installed:

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (v3.0.0 or above)
- [Android Studio](https://developer.android.com/studio) (for Android emulator)
- A [Supabase](https://supabase.com) account (free tier works)

---

### 1. Clone the Repository

```bash
git clone https://github.com/mclovin22117/theventapp
cd theventapp
```

### 2. Install Dependencies

```bash
flutter pub get
```

### 3. Setup Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **Project Settings → API** and copy your:
   - `Project URL`
   - `Anon Key`

#### Create the Config File

```bash
cp lib/supabase_config.example.dart lib/supabase_config.dart
```

Then open `lib/supabase_config.dart` and fill in your credentials:

```dart
const String supabaseUrl = 'YOUR_SUPABASE_URL';
const String supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

#### Create Database Tables

Run the following SQL in your **Supabase SQL Editor**:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  profile_picture_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0
);

-- Replies table
CREATE TABLE replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

#### Create Storage Buckets

In Supabase Dashboard → **Storage**, create two public buckets:
- `profiles` — for registration profile pictures
- `avatars` — for profile picture updates

---

### 4. Run the App

**On Web:**
```bash
flutter run -d web-server
```

**On Android Emulator:**
```bash
flutter run
```

**On a Physical Device:**
```bash
flutter devices        # list available devices
flutter run -d <device_id>
```

---

### 5. Build for Release

#### 📦 Build Android APK

**Debug APK** (for testing):
```bash
flutter build apk --debug
```

**Release APK** (for distribution):
```bash
flutter build apk --release
```

**Split APKs by ABI** (smaller file size, recommended):
```bash
flutter build apk --split-per-abi
```

> Output location:
> ```
> build/app/outputs/flutter-apk/app-release.apk
> ```

---

#### 🌐 Build for Web

```bash
flutter build web
```

> Output location:
> ```
> build/web/
> ```
> You can deploy the contents of `build/web/` to any static hosting service like:
> - [Vercel](https://vercel.com)
> - [Netlify](https://netlify.com)
> - [GitHub Pages](https://pages.github.com)
> - [Firebase Hosting](https://firebase.google.com/products/hosting)

**Build with a specific base URL** (if hosted in a subdirectory):
```bash
flutter build web --base-href /theventapp/
```

---

## 🍴 Fork & Build for Personal Use

1. Click **Fork** on the top right of this repository
2. Clone your forked repo:
   ```bash
   git clone https://github.com/mclovin22117/theventapp
   ```
3. Follow the [Getting Started](#-getting-started-install--run) steps above
4. Customize as you like — change the app name, colors, logo, etc.

> **Note:** `lib/supabase_config.dart` is in `.gitignore` — your credentials will never be pushed to GitHub.

---

## 🤝 Contributing

Contributions are welcome and appreciated!

### Steps to Contribute

1. **Fork** the repository
2. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and commit:
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a **Pull Request** on this repository

### Contribution Guidelines
- Keep code clean and well-commented
- Follow existing code structure and naming conventions
- Test your changes on both Web and Android before submitting PR
- One feature/fix per pull request

---

## 🐛 Raising an Issue

Found a bug or have a feature request?

1. Go to the [Issues](../../issues) tab
2. Click **New Issue**
3. Choose the appropriate template:
   - 🐛 **Bug Report** — describe the bug, steps to reproduce, expected vs actual behavior
   - 💡 **Feature Request** — describe the feature and why it would be useful
4. Add relevant labels and submit

> Please search existing issues before creating a new one to avoid duplicates.

---

## 📁 Project Structure

```
theventapp/
├── lib/
│   ├── main.dart                  # App entry point + Navigation
│   ├── supabase_config.dart       # Supabase credentials (gitignored)
│   ├── supabase_config.example.dart
│   ├── models/
│   │   ├── post_model.dart
│   │   └── reply_model.dart
│   ├── screens/
│   │   ├── splash_screen.dart
│   │   ├── login_screen.dart
│   │   ├── register_screen.dart
│   │   ├── home_screen.dart
│   │   ├── post_screen.dart
│   │   ├── post_details_screen.dart
│   │   ├── profile_screen.dart
│   │   └── about_screen.dart
│   └── services/
│       ├── auth_service.dart
│       ├── post_service.dart
│       └── profile_service.dart
├── assets/
│   └── images/
│       └── logo.png
└── pubspec.yaml
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by me
</div>
