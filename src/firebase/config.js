import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD_SZ_5HnJYwAhtuaqFoN6TEY7sJLvqWoE",
  authDomain: "himainformatikauti.firebaseapp.com",
  projectId: "himainformatikauti",
  storageBucket: "himainformatikauti.firebasestorage.app",
  messagingSenderId: "513886442708",
  appId: "1:513886442708:web:f88e728c6a54a8582c1741",
  measurementId: "G-62L5PFFR5K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
