import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpTVexQGczas4I2URF1ty3BgmVxCw9KOA",
  authDomain: "ksei-riief-web.firebaseapp.com",
  projectId: "ksei-riief-web",
  storageBucket: "ksei-riief-web.firebasestorage.app",
  messagingSenderId: "397972571949",
  appId: "1:397972571949:web:49036a359fde127c5cf5a4",
  measurementId: "G-77JX2HF6WB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
