import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDCYEIAJmPCMfvn3QavbfLvtLBqYJItVRU",
  authDomain: "plan-empresa.firebaseapp.com",
  projectId: "plan-empresa",
  storageBucket: "plan-empresa.firebasestorage.app",
  messagingSenderId: "373612692694",
  appId: "1:373612692694:web:91787e6bb72b7617d93577",
  measurementId: "G-CYH4L08Z9F"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app, analytics };
