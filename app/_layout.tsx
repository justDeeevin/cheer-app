import { Stack } from 'expo-router/stack';
import { firebaseContext, loggedInContext, FirebaseContext } from '@/authContext';
import { auth as authImport, db, storage } from '@/firebaseConfig';
import { i18nContext, useI18n } from '@/i18n'
import { useState } from 'react';

export default function Layout() {
  const i18n = useI18n();

  const [firebaseState, _setFirebaseState] = useState<FirebaseContext>({ auth: authImport, db, storage });
  const auth = firebaseState.auth;

  const [loggedIn, setLoggedIn] = useState(false);

  auth.onAuthStateChanged((user) => {
    if (user) {
      setLoggedIn(true);
    }
    else {
      setLoggedIn(false);
    }
  });

  return (
    <i18nContext.Provider value={i18n}>
      <loggedInContext.Provider value={loggedIn}>
        <firebaseContext.Provider value={firebaseState}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack >
        </firebaseContext.Provider>
      </loggedInContext.Provider>
    </i18nContext.Provider >
  );
}
