import { firebaseContext } from '@/context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential } from 'firebase/auth';

export default function TabLayout() {
  const { auth } = useContext(firebaseContext);

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
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'User',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
