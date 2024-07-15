import { Button, Text, View, Image } from "react-native";
import { Camera, PhotoFile, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { PermissionsPage } from "@/components/PermissionsPage";
import { useContext, useRef, useState } from "react";
import { i18nContext } from "@/i18n";
import { loggedInContext } from "@/authContext";
import { Link } from "expo-router";
import { styles } from "@/constants/style";

export default function Index() {
  const [photo, setPhoto] = useState<PhotoFile>();

  const loggedIn = useContext(loggedInContext);

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
    <View style={styles.centeredView}>
      {loggedIn ? <>
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
            style={{ width: "90%", height: "40%" }}
          />
          <Button title={t('upload')} onPress={uploadPhoto} />
        </>}
      </> : <>
        <Text>{t('signInWarning')}</Text>
        <Link href="/user" asChild>
          <Button title={t('goToUser')} />
        </Link>
      </>}
    </View>
  );
}
