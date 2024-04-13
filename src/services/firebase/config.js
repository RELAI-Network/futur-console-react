// Import the functions you need from the SDKs you need
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export const storage = getStorage(app);
