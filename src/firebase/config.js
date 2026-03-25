import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = { 
   apiKey: "AIzaSyAJfPcLHXYFMcr_ZTjfchqVAJSzvtpO0VA", 
   authDomain: "upm-events-335cb.firebaseapp.com", 
   projectId: "upm-events-335cb", 
   storageBucket: "upm-events-335cb.firebasestorage.app", 
   messagingSenderId: "1028581602931", 
   appId: "1:1028581602931:web:a5e5e123e05731147e9c06" 
 }; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
