import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Use as credenciais do .env
const firebaseConfig = {
  apiKey: "AIzaSyCaUtkvTs1VdX1kfB-8uAfZwCaD_NqKxn0",
  authDomain: "api-musicas-3af47.firebaseapp.com",
  projectId: "api-musicas-3af47",
  storageBucket: "api-musicas-3af47.appspot.com",
  messagingSenderId: "342150296993",
  appId: "1:342150296993:web:52a64694e9ddb8f12607e0"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços
export const db = getFirestore(app);
export const storage = getStorage(app);