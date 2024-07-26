import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useContext } from 'react';
import { i18nContext } from '@/i18n';
import { loggedInContext } from '@/context';

export default function TabLayout() {
  const i18n = useContext(i18nContext);
  const t = i18n.t.bind(i18n);

  const loggedIn = useContext(loggedInContext);

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('harvest'),
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="shopping-basket" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          // Here, `undefined` makes it use the tab name as the href
          href: loggedIn ? undefined : null,
          title: t('attendance'),
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="calendar-check-o" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: t('user'),
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
