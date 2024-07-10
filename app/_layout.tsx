import { Stack } from 'expo-router/stack';
import { firebaseContext } from '@/context';
import { auth, db } from '@/firebaseConfig';

export default function Layout() {
  return (
    <firebaseContext.Provider value={{ auth, db }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack >
    </firebaseContext.Provider>
  );
}
