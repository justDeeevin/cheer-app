import { Stack } from 'expo-router/stack';
import {
  firebaseContext,
  loggedInContext,
  FirebaseContext,
  participationContext,
} from '@/context';
import { auth as authImport, db, storage, realtime } from '@/firebaseConfig';
import { i18nContext, useI18n } from '@/i18n';
import { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { getDateString } from '@/utility/functions';
import { Participation } from '@/types/firestore';

export default function Layout() {
  const i18n = useI18n();

  const [firebaseState, _setFirebaseState] = useState<FirebaseContext>({
    auth: authImport,
    db,
    storage,
    realtime,
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

  const [participationLogged, setParticipationLogged] = useState(false);
  useEffect(() => {
    const effect = async () => {
      if (!auth.currentUser?.uid) return;
      const participationCollection = await getDocs(
        collection(db, 'people', auth.currentUser?.uid ?? '', 'participation')
      );
      if (
        participationCollection.docs.find(doc => {
          const data = doc.data() as Participation;
          const loggedDate = data.date;
          return loggedDate === getDateString();
        })
      )
        setParticipationLogged(true);
    };

    effect();
  }, [auth.currentUser?.uid]);

  return (
    <participationContext.Provider
      value={[participationLogged, setParticipationLogged]}
    >
      <i18nContext.Provider value={i18n}>
        <loggedInContext.Provider value={loggedIn}>
          <firebaseContext.Provider value={firebaseState}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </firebaseContext.Provider>
        </loggedInContext.Provider>
      </i18nContext.Provider>
    </participationContext.Provider>
  );
}
