import { Text } from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';
import { useEffect } from 'react';
import { styles } from '@/constants/style';

export function PermissionsPage() {
  const { requestPermission } = useCameraPermission();

  useEffect(() => {
    requestPermission();
  }, []);

  return <Text style={styles.text}> Camera permissions required </Text>;
}
