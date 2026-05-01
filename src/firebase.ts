import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBvljyA9z5O6zQHRtLIDxKnwyCxCF2vqL8",
  authDomain: "mustapha-portfolio.firebaseapp.com",
  projectId: "mustapha-portfolio",
  storageBucket: "mustapha-portfolio.firebasestorage.app",
  messagingSenderId: "597476763368",
  appId: "1:597476763368:web:48cdeccdc1bc21b22e0b5d",
  measurementId: "G-9HBCZ8T3N0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
