import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeFirebase from '@react-native-firebase/app';
import ReactNativeFirebaseAuth from '@react-native-firebase/auth';
import ReactNativeFirebaseFirestore from '@react-native-firebase/firestore';

let app;
let auth;
let db;

if (Platform.OS !== 'web') {
  // React Native Firebase for mobile
  if (ReactNativeFirebase.apps.length === 0) {
    // Initialize with default options, assuming you have a firebase.json or google-services.json
    app = ReactNativeFirebase.initializeApp({}); 
  } else {
    app = ReactNativeFirebase.app();
  }
  auth = ReactNativeFirebaseAuth();
  db = ReactNativeFirebaseFirestore();
  console.log('React Native Firebase initialized');
} else {
  // Firebase JS SDK for web
  const firebaseConfig = {
      apiKey: "AIzaSyC2rnbhBwXSqIbypfOU4ywrc2PG9fY_rR8",
      authDomain: "agricare-68b19.firebaseapp.com",
      projectId: "agricare-68b19",
      storageBucket: "agricare-68b19.appspot.com",
      messagingSenderId: "872782355781",
      appId: "1:872782355781:web:3d2aada85d4f2c9519b22c",
      measurementId: "G-NHZ569079X"
  };

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase JS SDK initialized for web');
}

export { app, auth, db };
export default app;
