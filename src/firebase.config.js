import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUIT1QSk7bAGJ9q0vz0RRrscHJPZ5_kc0",
  authDomain: "house-marketplace-7db07.firebaseapp.com",
  projectId: "house-marketplace-7db07",
  storageBucket: "house-marketplace-7db07.appspot.com",
  messagingSenderId: "258832222285",
  appId: "1:258832222285:web:c3a0e6e76c7906fa3f3404"
};

// Initialize Firebase
initializeApp(firebaseConfig);

export const db = getFirestore()