import { Button, Text, View, Image } from "react-native";
import { Camera, PhotoFile, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { PermissionsPage } from "@/components/PermissionsPage";
import { useRef, useState } from "react";

export default function Index() {

  const [photo, setPhoto] = useState<PhotoFile>();

  const { hasPermission } = useCameraPermission();
  const device = useCameraDevice("back");

  if (!hasPermission) return <PermissionsPage />;

  if (device === undefined) return <Text>No camera found</Text>;

  const cameraRef = useRef<Camera>(null);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Camera
        ref={cameraRef}
        device={device}
        isActive={true}
        style={{ width: "90%", height: "40%" }}
        photo={true}
      />
      <Button
        onPress={async () => setPhoto(await cameraRef.current?.takePhoto())}
        title="Take Photo"
      />
      {photo !== undefined &&
        <Image
          src={`file://${(photo as PhotoFile).path}`}
          style={{ width: "90%", height: "40%" }}
        />
      }
    </View>
  );
}
