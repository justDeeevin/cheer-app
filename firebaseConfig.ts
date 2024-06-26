import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyAql__a3U-pgQ21bTofEN_otegnM0N11lM",
  authDomain: "cheer-app-prototype.firebaseapp.com",
  projectId: "cheer-app-prototype",
  storageBucket: "cheer-app-prototype.appspot.com",
  messagingSenderId: "949576645162",
  appId: "1:949576645162:web:5ebaa19d4c8b88dcff6153",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
