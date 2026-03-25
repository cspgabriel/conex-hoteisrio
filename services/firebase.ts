import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAft-DvGInVQtbnepuxClPiHT06TrU1PhM',
  authDomain: 'asse-b5046.firebaseapp.com',
  projectId: 'asse-b5046',
  storageBucket: 'asse-b5046.firebasestorage.app',
  messagingSenderId: '515042504577',
  appId: '1:515042504577:web:c9f9dc3225445b89b9c280',
  measurementId: 'G-K9ZQTLXTRM',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
