import { Stack } from 'expo-router/stack';
import { firebaseContext } from '@/authContext';
import { auth, db } from '@/firebaseConfig';
import { i18nContext, useI18n } from '@/i18n'
import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential } from 'firebase/auth';

export default function Layout() {
  const i18n = useI18n();

  useEffect(() => {
    const effect = async () => {
      if (!auth.currentUser) {
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
      }
    }

    effect()
  }, [])

  return (
    <i18nContext.Provider value={i18n}>
      <firebaseContext.Provider value={{ auth, db }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack >
      </firebaseContext.Provider>
    </i18nContext.Provider>
  );
}
