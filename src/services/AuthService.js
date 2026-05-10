// src/services/AuthService.js
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Estos datos los copias de tu consola de Firebase (App Web)
const firebaseConfig = {
  apiKey: "AIzaSyCjSP3aBoa--dv3bBPGufhEn6KHKdybHqk",
  authDomain: "controlgastos-dps.firebaseapp.com",
  projectId: "controlgastos-dps",
  storageBucket: "controlgastos-dps.firebasestorage.app",
  messagingSenderId: "408281365009",
  appId: "1:408281365009:web:e743d9e220f1469c338fb0",
  measurementId: "G-XY85EFKS4M"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

class AuthService {
  // Metodo para el REGISTRO
  async signUpWithEmail(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }

  // Metodo para el LOGIN
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }
}

export default new AuthService();