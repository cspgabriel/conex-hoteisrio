import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDE4y3-K2QlOi1w0Ep9yEsO6ZhtNtOKxM4',
  authDomain: 'br-ike.firebaseapp.com',
  projectId: 'br-ike',
  storageBucket: 'br-ike.firebasestorage.app',
  messagingSenderId: '198938622611',
  appId: '1:198938622611:web:7156a07b0eb12cf2e82b66',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
