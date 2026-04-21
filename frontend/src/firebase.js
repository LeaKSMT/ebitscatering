import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD_PYOBJjaSdcWOSLvyp_2SwDk9Msz24fI",
    authDomain: "ebits-catering-system.firebaseapp.com",
    projectId: "ebits-catering-system",
    storageBucket: "ebits-catering-system.firebasestorage.app",
    messagingSenderId: "688944030410",
    appId: "1:688944030410:web:a57b05acc58d05638f4a33",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: "select_account",
});