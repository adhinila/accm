// Firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD2_g0PKw_eZtK5aHUgJiFDPWn8OxUmUfQ",
  authDomain: "gros-2f88d.firebaseapp.com",
  projectId: "gros-2f88d",
  storageBucket: "gros-2f88d.appspot.com",
  messagingSenderId: "239170438573",
  appId: "1:239170438573:web:856b91b995100f45d38d24",
  measurementId: "G-K8VGMWZM4W",
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { firestore, auth };
