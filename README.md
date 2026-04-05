# 🚀 Linkaro — Your Personal Digital Hub

**Linkaro** is a premium, cloud-synced browser extension designed to store, manage, and share your social and professional links with elegance and efficiency. Built with **Manifest V3** and **Firebase**, it keeps your digital ecosystem synchronized across all your devices.

![Linkaro Screenshot](https://i.imgur.com/uDp0KZg.png)

---

## ✨ Key Features

- ☁️ **Cloud Sync:** Real-time synchronization via **Firebase Firestore**.
- 🔐 **Secure Auth:** Seamless login with **Google OAuth**.
- 🌓 **Adaptive UI:** Fully responsive design with **Dark/Light Mode** support.
- 🔍 **Intelligent Search:** Instantly filter through your links by name or URL.
- 🖼️ **Dynamic Favicons:** Automatic brand icon fetching for a rich visual experience.
- ⚡ **Quick Copy:** One-click clipboard functionality for effortless sharing.
- 🛠️ **Smart Extraction:** Automatically identifies and labels links during entry.

---

## 🛠️ Tech Stack

- **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage:** Firebase Firestore
- **Identity:** Firebase Auth (Google Provider)
- **Extension API:** Manifest V3
- **Icons:** FontAwesome 6+, Google Favicon API

---

## 🚀 Local Setup & Installation

Follow these steps to set up Linkaro for local development or personal use:

### 1. Prerequisites
- A Google Account (for Firebase and OAuth).
- A Chromium-based browser (Chrome, Edge, Brave, etc.).

### 2. Clone the Repository
```bash
git clone https://github.com/parthpanchal123/Linkaro.git
cd Linkaro
```

### 3. Firebase Configuration
Linkaro uses Firebase for real-time link synchronization.
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project named **Linkaro**.
3.  In your project, enable **Firestore Database** (start in Test Mode or locked with appropriate rules).
4.  Navigate to **Project Settings > General** and add a **Web App**.
5.  Copy your Firebase configuration object.
6.  Rename `firebase-config.example.js` to `firebase-config.js`.
7.  Replace the placeholders in `firebase-config.js` with your project's credentials.

### 4. Enable Google Auth
1.  In the Firebase Console, go to **Authentication > Sign-in method**.
2.  Enable the **Google** provider.

### 5. Google OAuth 2.0 Client ID
To use Google Login in a browser extension, you need an OAuth Client ID specifically for extensions.
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Select your Firebase project.
3.  Go to **APIs & Services > Credentials**.
4.  Click **Create Credentials > OAuth client ID**.
5.  Select **Chrome extension** as the Application Type.
6.  Provide the extension ID (you'll get this after loading the extension in Step 6, or use a temporary placeholder).
7.  Rename `manifest.example.json` to `manifest.json`.
8.  Add your `client_id` to the `oauth2` section in `manifest.json`.

### 6. Installation (Load Unpacked)
1.  Open your browser and navigate to `chrome://extensions`.
2.  Enable **Developer Mode** in the top right corner.
3.  Click **Load unpacked**.
4.  Select the `Linkaro` folder from your local machine.

---

## 📖 How to Use

1.  **Login:** Click the extension icon and sign in with your Google account.
2.  **Add Links:** Use the "+" button to add a new link. Type the name (e.g., "GitHub") and the URL.
3.  **Search:** Use the search bar at the top to find specific links instantly.
4.  **Copy/Share:** Click the **Copy** button on any link bubble to copy it to your clipboard.
5.  **Customize:** Toggle between Light and Dark modes using the theme icon in the header.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🌟 Support

If you find Linkaro useful, please consider giving the repository a 🌟!

### Developed with passion by [Parth Panchal](https://github.com/parthpanchal123)
