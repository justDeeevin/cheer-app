import { Button, Text, View } from 'react-native';
import { useContext } from 'react';
import { i18nContext } from '@/i18n';
import { loggedInContext } from '@/context';
import { Link } from 'expo-router';
import { styles } from '@/constants/style';
import HarvestForm from '@/components/HarvestForm';
import Toast from 'react-native-toast-message';

export default function Index() {
  const loggedIn = useContext(loggedInContext);

  const i18n = useContext(i18nContext);
  const t = i18n.t.bind(i18n);

  return (
    <View style={styles.centeredView}>
      {loggedIn ? (
        <HarvestForm />
      ) : (
        <>
          <Text>{t('signInWarning')}</Text>
          <Link href="/user" asChild>
            <Button title={t('goToUser')} />
          </Link>
        </>
      )}
      <Toast />
    </View>
  );
}
