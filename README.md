# TheVent

<div align="center">
  <img src="assets/images/logo.png" alt="TheVent Logo" width="100" height="100" />
  <h2>Speak freely. Anonymously.</h2>

  ![Flutter](https://img.shields.io/badge/Flutter-3.x-blue?logo=flutter)
  ![Firebase](https://img.shields.io/badge/Firebase-Backend-orange?logo=firebase)
  ![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-lightgrey)
  ![License](https://img.shields.io/badge/License-MIT-purple)
</div>

TheVent is an open-source anonymous social app where users can post feelings and thoughts, like posts, and reply to others.

## Current Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Flutter + Material UI |
| Language | Dart |
| Backend Services | Firebase |
| Authentication | Firebase Authentication (Email/Password) |
| Database | Cloud Firestore |
| Media Storage | Firebase Storage |
| Navigation | Flutter Navigator (named routes + onGenerateRoute) |
| Image Picker | image_picker |

## Features

- Anonymous username-based login flow
- Create vents (posts), like vents, and reply
- Profile with optional profile picture
- Dark themed UI
- Android, iOS, and Web support from one codebase

## Getting Started

### 1. Prerequisites

- Flutter SDK (3.x)
- Android Studio / Xcode (for mobile)
- A Firebase project

### 2. Clone and Install

```bash
git clone https://github.com/mclovin22117/theventapp
cd theventapp
flutter pub get
```

### 3. Firebase Setup

1. Create a Firebase project.
2. Enable Authentication:
   - Sign-in method: Email/Password
3. Create Firestore Database.
4. Create Firebase Storage bucket (if your region supports it).
5. Configure FlutterFire:

```bash
flutterfire configure
```

This generates `lib/firebase_options.dart` and updates platform config files.

### 4. Android Config

- Ensure `android/app/google-services.json` exists.
- The app already includes Google Services Gradle plugin setup.

### 5. Run

```bash
flutter run
```

To target a specific device:

```bash
flutter devices
flutter run -d <device_id>
```

## Build

Android release APK:

```bash
flutter build apk --release
```

Web:

```bash
flutter build web
```

## Important Notes

- If `firebase_options.dart` or `google-services.json` keys are rotated, rerun `flutterfire configure` and rebuild.
- Profile picture upload requires Firebase Storage to be available for your selected Firebase project region.

## Project Structure

```text
theventapp/
├── lib/
│   ├── main.dart
│   ├── firebase_options.dart
│   ├── models/
│   ├── screens/
│   └── services/
├── android/
├── ios/
├── web/
└── pubspec.yaml
```

## Contributing

1. Fork the repository
2. Create a branch
3. Commit your changes
4. Push and open a pull request

## License

This project is licensed under the MIT License. See `LICENSE`.
