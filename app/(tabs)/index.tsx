import { Button, Image, Text, View, } from "react-native";
import { useContext, useState, useEffect, useRef } from "react";
import { i18nContext } from "@/i18n";
import { loggedInContext } from "@/authContext";
import { Link } from "expo-router";
import { styles } from "@/constants/style";
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';
import { firebaseContext } from '@/authContext';
import { addDoc, collection, doc, getDocs } from "firebase/firestore";
import { Garden, Harvest } from "@/types/firestore";
import { PhotoFile, useCameraPermission, useCameraDevice, Camera } from "react-native-vision-camera";
import { PermissionsPage } from "@/components/PermissionsPage";
import { readAsStringAsync } from 'expo-file-system';

export default function Index() {
  const loggedIn = useContext(loggedInContext);

  const i18n = useContext(i18nContext);
  const t = i18n.t.bind(i18n);

  const { db, auth, storage } = useContext(firebaseContext);

  const [gardens, setGardens] = useState<ItemType<string>[]>([]);
  const [gardenListOpen, setGardenListOpen] = useState(false);
  const [garden, setGarden] = useState<string | null>(null);

  const [photo, setPhoto] = useState<PhotoFile>();
  const { hasPermission: hasCameraPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const cameraRef = useRef<Camera>(null)

  useEffect(() => {
    const effect = async () => {
      const gardensCollection = await getDocs(collection(db, 'gardens'))
      const gardens: ItemType<string>[] = [];
      gardensCollection.forEach((doc) => {
        const garden = doc.data() as Garden;
        gardens.push({ value: doc.id, label: `${garden.houseNumber} ${garden.streetName}` });
      })

      setGardens(gardens);
    }

    effect()
  })

  const submit = async () => {
    const image = await readAsStringAsync(`file://${photo?.path}`);

    const harvest: Harvest = {
      date: new Date(),
      person: doc(db, 'people', auth.currentUser?.uid as string),
      garden: doc(db, 'gardens', garden as string),
    }

    await addDoc(collection(db, 'harvests'), harvest);
  }

  if (!hasCameraPermission) return <PermissionsPage />;
  if (device === undefined) return <Text>No camera found</Text>;

  return (
    <View style={styles.centeredView}>
      {loggedIn ? <>
        <DropDownPicker
          placeholder={t("selectGarden")}
          open={gardenListOpen}
          value={garden}
          items={gardens}
          setOpen={setGardenListOpen}
          setValue={setGarden}
          setItems={setGardens}
          style={{ width: 200, alignSelf: 'center' }}
          dropDownContainerStyle={{ width: 200, alignSelf: 'center' }}
        />
        {garden && <>
          <Camera
            ref={cameraRef}
            device={device}
            isActive={true}
            style={{ width: "90%", height: "40%" }}
            photo={true}
          />
          <Button title={t('takePhoto')} onPress={async () => setPhoto(await cameraRef.current?.takePhoto())} />
          {photo && <Image src={`file://${photo.path}`} style={{ width: "90%", height: "40%" }} />}
        </>}
        {garden && photo && <Button title={t('submit')} onPress={submit} />}
      </> : <>
        <Text>{t('signInWarning')}</Text>
        <Link href="/user" asChild>
          <Button title={t('goToUser')} />
        </Link>
      </>}
    </View>
  );
}
