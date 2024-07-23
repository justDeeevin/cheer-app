import {
  Button,
  Text,
  ScrollView,
  TextInput,
  View,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useContext, useState, useEffect, useRef } from 'react';
import { i18nContext } from '@/i18n';
import { loggedInContext } from '@/authContext';
import { Link } from 'expo-router';
import { styles } from '@/constants/style';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';
import { firebaseContext } from '@/authContext';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getDoc,
  DocumentReference,
} from 'firebase/firestore';
import { Garden, Harvest } from '@/types/firestore';
import { useLocales } from 'expo-localization';

export default function Index() {
  const locales = useLocales();
  const locale = locales[0].languageCode ?? '';

  const loggedIn = useContext(loggedInContext);

  const i18n = useContext(i18nContext);
  const t = i18n.t.bind(i18n);

  const { db, auth } = useContext(firebaseContext);

  const [gardens, setGardens] = useState<ItemType<string>[]>([]);
  const [gardenListOpen, setGardenListOpen] = useState(false);
  const [garden, setGarden] = useState<string | null>(null);

  useEffect(() => {
    const effect = async () => {
      const gardensCollection = await getDocs(collection(db, 'gardens'));
      const gardens: ItemType<string>[] = [];
      gardensCollection.forEach(doc => {
        const garden = doc.data() as Garden;
        gardens.push({
          value: doc.id,
          label: `${garden.streetName}${garden.houseNumber ? ', ' + garden.houseNumber + ' ' : ''}${garden.nickname ? '(' + garden.nickname + ')' : ''}`,
        });
      });

      setGardens(gardens);
    };

    effect();
  }, []);

  const [crops, setCrops] = useState<ItemType<string>[]>([]);
  const [cropListOpen, setCropListOpen] = useState(false);
  const [crop, setCrop] = useState<string | null>(null);
  const [unit, setUnit] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const effect = async () => {
      const cropsCollection = await getDocs(collection(db, 'crops'));
      const crops: ItemType<string>[] = [];
      cropsCollection.forEach(async document => {
        crops.push({
          value: document.id,
          label: (
            await getDoc(doc(db, 'crops', document.id, 'name', locale))
          ).data()?.value,
        });
      });

      setCrops(crops);
    };

    effect();
  }, [locale]);

  useEffect(() => {
    const effect = async () => {
      if (!crop) setUnit(null);
      else {
        const unitDoc = (
          await getDoc(doc(db, 'crops', crop, 'units', 'required'))
        ).data()?.value as DocumentReference;
        setUnit({
          id: unitDoc.id,
          name: (
            await getDoc(doc(db, 'cropUnits', unitDoc.id, 'name', locale))
          ).data()?.value,
        });
      }
    };

    effect();
  }, [crop, locale]);

  const [measure, setMeasure] = useState<number | null>(null);

  const measureInputRef = useRef<TextInput>(null);
  Keyboard.addListener('keyboardDidHide', () => {
    measureInputRef.current?.blur();
  });

  const submit = async () => {
    const harvest: Harvest = {
      date: new Date(),
      person: doc(db, 'people', auth.currentUser?.uid as string),
      garden: doc(db, 'gardens', garden as string),
    };

    const harvestDoc = await addDoc(collection(db, 'harvests'), harvest);

    await addDoc(collection(db, 'harvests', harvestDoc.id, 'measures'), {
      unit: doc(db, 'cropUnits', unit?.id as string),
      measure,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.centeredView}>
      {loggedIn ? (
        <>
          <DropDownPicker
            placeholder={t('selectGarden')}
            open={gardenListOpen}
            setOpen={setGardenListOpen}
            value={garden}
            setValue={setGarden}
            items={gardens}
            setItems={setGardens}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdown}
          />
          {garden && (
            <DropDownPicker
              placeholder={t('selectCrop')}
              open={cropListOpen}
              setOpen={setCropListOpen}
              value={crop}
              setValue={setCrop}
              items={crops}
              setItems={setCrops}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdown}
              searchable={true}
              searchPlaceholder="Search..."
            />
          )}
          {crop && !unit && <ActivityIndicator />}
          {unit && (
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TextInput
                ref={measureInputRef}
                keyboardType="numeric"
                value={measure?.toString()}
                onChangeText={text => setMeasure(parseInt(text))}
                style={styles.input}
              />
              <Text>{unit?.name}</Text>
            </View>
          )}
          {measure && <Button title={t('submit')} onPress={submit} />}
        </>
      ) : (
        <>
          <Text>{t('signInWarning')}</Text>
          <Link href="/user" asChild>
            <Button title={t('goToUser')} />
          </Link>
        </>
      )}
    </ScrollView>
  );
}
