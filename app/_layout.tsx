import { Stack } from 'expo-router/stack';
import {
  firebaseContext,
  loggedInContext,
  FirebaseContext,
  attendanceContext,
} from '@/context';
import { auth as authImport, db, storage } from '@/firebaseConfig';
import { i18nContext, useI18n } from '@/i18n';
import { useState, useEffect } from 'react';
import { getDocs, collection, Timestamp } from 'firebase/firestore';

export default function Layout() {
  const i18n = useI18n();

  const [firebaseState, _setFirebaseState] = useState<FirebaseContext>({
    auth: authImport,
    db,
    storage,
  });
  const auth = firebaseState.auth;

  const [loggedIn, setLoggedIn] = useState(false);

  auth.onAuthStateChanged(user => {
    if (user) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  });

  const [attendanceLogged, setAttendanceLogged] = useState(false);
  useEffect(() => {
    const effect = async () => {
      const attendanceCollection = await getDocs(
        collection(db, 'people', auth.currentUser?.uid ?? '', 'attendance')
      );
      if (
        attendanceCollection.docs.find(doc => {
          const loggedDate = (doc.data().date as Timestamp)
            .toDate()
            .toISOString()
            .replace(/T.*$/, '');
          const thisDate = new Date().toISOString().replace(/T.*$/, '');
          return loggedDate === thisDate;
        })
      )
        setAttendanceLogged(true);
    };

    effect();
  });

  return (
    <attendanceContext.Provider value={[attendanceLogged, setAttendanceLogged]}>
      <i18nContext.Provider value={i18n}>
        <loggedInContext.Provider value={loggedIn}>
          <firebaseContext.Provider value={firebaseState}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </firebaseContext.Provider>
        </loggedInContext.Provider>
      </i18nContext.Provider>
    </attendanceContext.Provider>
  );
}
