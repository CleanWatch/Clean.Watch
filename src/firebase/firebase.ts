/* src/firebase/firebase.ts */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: 'AIzaSyCF8BQ6GWKxJRPWENeNR_vnelH3TaJJan4',
  authDomain: 'owanticheat.firebaseapp.com',
  projectId: 'owanticheat',
  storageBucket: 'owanticheat.firebasestorage.app',
  messagingSenderId: '100898239448',
  appId: '1:100898239448:web:9fab069ba0e816616ef8ad',
};

const app = initializeApp(firebaseConfig);

//initializeAppCheck(app, {
//provider: new ReCaptchaV3Provider("6LdNND4tAAAAAGd66UkZVfYcebdTz2JVBJYSkDto"),
//isTokenAutoRefreshEnabled: true,
//});

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
