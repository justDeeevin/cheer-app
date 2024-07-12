import { Button, Text, View, Image } from "react-native";
import { Camera, PhotoFile, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { PermissionsPage } from "@/components/PermissionsPage";
import { useContext, useRef, useState } from "react";
import { i18nContext } from "@/i18n";
import { styles } from "@/constants/style";

export default function Index() {
  const [photo, setPhoto] = useState<PhotoFile>();

  const { hasPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const cameraRef = useRef<Camera>(null);

  const i18n = useContext(i18nContext);
  const t = i18n.t.bind(i18n);

  if (!hasPermission) return <PermissionsPage />;

  if (device === undefined) return <Text>No camera found</Text>;

  const uploadPhoto = async () => {
  };

  return (
      <Camera
        ref={cameraRef}
        device={device}
        isActive={true}
        style={{ width: "90%", height: "40%" }}
        photo={true}
      />
      <Button
        onPress={async () => setPhoto(await cameraRef.current?.takePhoto())}
        title={t('photo')}
      />
      {photo !== undefined && <>
        <Image
          src={`file://${(photo as PhotoFile).path}`}
    <View style={styles.centeredView}>
          style={{ width: "90%", height: "40%" }}
        />
        <Button title={t('upload')} onPress={uploadPhoto} />
      </>}
    </View>
  );
}
