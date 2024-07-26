This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: install packages

```bash
npm install
```

## Step 2: Add files

Add the following files:

- selligent.json (root project directory)
- android/app/google-services.json

## Step 3: Start the Application

The setup was only done for Android, iOS is not supported.

```bash
npm run android
```

If everything is set up correctly, you should see your new app running in your _Android Emulator_.

The app will ask for permissions to send push notifications. Grant the permission and start sending Push+InApp messages.

When an InApp message is received, an alert will be displayed.
