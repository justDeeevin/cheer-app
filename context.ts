import { createContext } from 'react';
import { auth, db, storage } from '@/firebaseConfig';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import React from 'react';

export interface FirebaseContext {
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
}

export const firebaseContext = createContext<FirebaseContext>({
  auth,
  db,
  storage,
});

export const loggedInContext = createContext<boolean>(false);

export const attendanceContext = createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>]
>([false, () => {}]);
