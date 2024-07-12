import { Stack } from 'expo-router/stack';
import { firebaseContext, loggedInContext, FirebaseContext } from '@/authContext';
import { auth as authImport, db } from '@/firebaseConfig';
import { i18nContext, useI18n } from '@/i18n'
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential } from 'firebase/auth';

export default function Layout() {
  const i18n = useI18n();

  const [firebaseState, _setFirebaseState] = useState<FirebaseContext>({ auth: authImport, db });
  const auth = firebaseState.auth;

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const effect = async () => {
      if (!loggedIn) {
        const credentialType = await SecureStore.getItemAsync('authProvider');
        if (credentialType === 'Google') {
          const idToken = await SecureStore.getItemAsync('idToken');
          const accessToken = await SecureStore.getItemAsync('accessToken');
          const cred = GoogleAuthProvider.credential(idToken, accessToken);
          await signInWithCredential(auth, cred);
        }
        else if (credentialType === 'Apple') {
          const idToken = await SecureStore.getItemAsync('idToken') as string;
          const accessToken = await SecureStore.getItemAsync('accessToken') as string;
          const firebaseCred = new OAuthProvider('apple.com')
            .credential({
              idToken,
              accessToken
            });
          await signInWithCredential(auth, firebaseCred);
        }

        if (auth.currentUser) setLoggedIn(true);
      }
    }

    effect()
  }, [])

  return (
    <i18nContext.Provider value={i18n}>
      <loggedInContext.Provider value={{ loggedIn, setLoggedIn }}>
        <firebaseContext.Provider value={firebaseState}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack >
        </firebaseContext.Provider>
      </loggedInContext.Provider>
    </i18nContext.Provider >
  );
}
