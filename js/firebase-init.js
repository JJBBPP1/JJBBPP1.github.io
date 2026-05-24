import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDTslJvs8MrEYdrJhQD-ev19d06WSPSeTI",
  authDomain: "agenda-51723.firebaseapp.com",
  projectId: "agenda-51723",
  storageBucket: "agenda-51723.firebasestorage.app",
  messagingSenderId: "273930695051",
  appId: "1:273930695051:web:8ab3688c7263a3e689bf8e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
