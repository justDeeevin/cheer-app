import { createContext } from "react";
import { auth, db } from "@/firebaseConfig";
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";

interface FirebaseContext {
  auth: Auth;
  db: Firestore;
}

export const firebaseContext = createContext<FirebaseContext>({ auth, db });
