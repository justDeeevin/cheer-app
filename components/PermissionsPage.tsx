import { Text } from "react-native";
import { useCameraPermission } from "react-native-vision-camera";
import { useEffect } from "react";

export function PermissionsPage() {
  const { requestPermission } = useCameraPermission();

  useEffect(() => {
    requestPermission();
  }, []);

  return <Text> Camera permissions required </Text>;
}
