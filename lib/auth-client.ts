import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

// Get the correct base URL based on environment
const getBaseURL = () => {
  // In development, use the dev server URL
  if (__DEV__) {
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
      const host = debuggerHost.split(':').shift();
      return `http://${host}:8081`;
    }
  }
  // In production, use your production URL
  return "https://your-production-url.com";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  disableDefaultFetchPlugins: true,
  plugins: [
    expoClient({
      scheme: "exp",
      storagePrefix: "splitwise",
      storage: SecureStore,
    }),
  ],
});
