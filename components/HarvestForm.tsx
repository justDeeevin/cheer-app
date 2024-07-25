import { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Keyboard,
  TextInput,
  Button,
} from 'react-native';
import { i18nContext } from '@/i18n';
import { styles } from '@/constants/style';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';
import { firebaseContext, attendanceContext } from '@/context';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getDoc,
  DocumentReference,
  Timestamp,
} from 'firebase/firestore';
import { useLocales } from 'expo-localization';
import { Garden, Harvest as Harvest, RealtimeHarvest } from '@/types/firestore';
import Toast from 'react-native-toast-message';
import { ref, set } from 'firebase/database';
import { useList } from 'react-firebase-hooks/database';
import { getDateString } from '@/utility/functions';

export default function HarvestForm() {
  const locales = useLocales();
  const locale = locales[0].languageCode ?? '';

  const i18n = useContext(i18nContext);
  const t = i18n.t.bind(i18n);

  const { db, auth, realtime } = useContext(firebaseContext);

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

  const [measure, setMeasure] = useState<string>('');

  const measureInputRef = useRef<TextInput>(null);
  Keyboard.addListener('keyboardDidHide', () => {
    measureInputRef.current?.blur();
  });

  const [attendanceLogged, setAttendanceLogged] = useContext(attendanceContext);

  const logAttendance = async () => {
    setAttendanceLogged(true);
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    addDoc(
      collection(db, 'people', auth.currentUser?.uid ?? '', 'attendance'),
      {
        date: Timestamp.fromDate(date),
        garden: doc(db, 'gardens', garden ?? ''),
      }
    );

    Toast.show({ type: 'info', text1: 'Attendance logged' });
  };

  const [harvestsData, harvestsLoading, _] = useList(
    ref(realtime, `harvests/${getDateString()}/${garden}/${crop}`)
  );

  const submit = async () => {
    const realtimeHarvest: RealtimeHarvest = {
      person: auth.currentUser?.uid ?? '',
      measures: [
        {
          unit: `cropUnits/${unit?.id ?? ''}`,
          measure: parseFloat(measure),
        },
      ],
    };

    set(ref(realtime, `harvests/${getDateString()}/${garden}/${crop}`), [
      realtimeHarvest,
      ...(harvestsData?.map(harvest => harvest.val() as Harvest) ?? []),
    ]);

    const harvest: Harvest = {
      date: getDateString(),
      person: doc(db, 'people', auth.currentUser?.uid ?? ''),
      garden: doc(db, 'gardens', garden ?? ''),
      crop: doc(db, 'crops', crop ?? ''),
    };

    const newHarvest = await addDoc(collection(db, 'harvests'), harvest);
    addDoc(collection(db, 'harvests', newHarvest.id, 'measures'), {
      unit: doc(db, 'cropUnits', unit?.id ?? ''),
      measure: parseFloat(measure),
    });

    if (!attendanceLogged) logAttendance();
  };

  const [totalToday, setTotalToday] = useState(0);

  useEffect(() => {
    if (!crop || !garden) return;
    const harvests =
      harvestsData?.map(harvest => harvest.val() as RealtimeHarvest) ?? [];
    setTotalToday(
      harvests.reduce((acc, harvest) => acc + harvest.measures[0].measure, 0)
    );
  }, [crop, garden, harvestsData]);

  return (
    <View style={styles.centeredView}>
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
        <>
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
              onChangeText={text => {
                if (text === '.') setMeasure(text);
                else if (
                  !(
                    text.startsWith('.') && (text.match(/\./g) ?? []).length > 1
                  )
                )
                  setMeasure(
                    text
                      .replace(/,|-| /g, '')
                      .replace(
                        /(\.?)\.*([0-9]*)(\.?)\.*([0-9]*)\.*/g,
                        '$1$2$3$4'
                      )
                  );
              }}
              style={styles.input}
            />
            <Text>{unit?.name}</Text>
          </View>
          {harvestsLoading ? (
            <ActivityIndicator />
          ) : (
            <Text>
              {t('totalToday')}: {totalToday}
            </Text>
          )}
        </>
      )}
      {measure && measure !== '.' && (
        <Button title={t('submit')} onPress={submit} />
      )}
    </View>
  );
}
