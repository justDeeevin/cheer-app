import { Stack } from 'expo-router/stack';
import { firebaseContext } from '@/context';
import { auth, db } from '@/firebaseConfig';
import { i18nContext, useI18n } from '@/i18n'

export default function Layout() {
  const i18n = useI18n();

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
