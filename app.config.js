export default {
  name: "cheer-app",
  slug: "cheer-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription: "Allow $(PRODUCT_NAME) to access your camera",
    },
    bundleIdentifier: "com.justdeeevin.cheerapp",
    usesAppleSignin: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    permissions: ["android.permission.CAMERA"],
    package: "com.justdeeevin.cheerapp",
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-apple-authentication",
    "expo-localization",
    "react-native-vision-camera",
    "@react-native-google-signin/google-signin",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "5a837642-5310-476b-9326-03de8e42f05a",
    },
  },
  platforms: ["ios", "android"],
};
