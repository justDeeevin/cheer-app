import { Text } from "react-native";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { PermissionsPage } from "@/components/PermissionsPage";

export default function Index() {

  const { hasPermission } = useCameraPermission();
  const device = useCameraDevice("back");

  if (!hasPermission) return <PermissionsPage />;

  if (device == null) return <Text>No camera found</Text>;

  return (
    <Camera device={device} isActive={true} style={{ width: "100%", height: "100%" }} />
  );
}
