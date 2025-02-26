// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyClWtnLVTHvU9Pouc47IvLpXrmXv1-334c",
    authDomain: "lingochat-21823.firebaseapp.com",
    projectId: "lingochat-21823",
    storageBucket: "lingochat-21823.firebasestorage.app",
    messagingSenderId: "725333115110",
    appId: "1:725333115110:web:455751513a151d5ce47b27",
    measurementId: "G-8PBF4E9HSS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);