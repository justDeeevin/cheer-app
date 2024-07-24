import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { Button } from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { i18nContext } from '@/i18n';
import { styles } from '@/constants/style';
import { attendanceContext, firebaseContext, loggedInContext } from '@/context';
import { addDoc, collection, doc, getDocs } from 'firebase/firestore';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';
import { Garden } from '@/types/firestore';
import { Calendar } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';

export default function Attendance() {
  const i18n = useContext(i18nContext);
  const t = i18n.t.bind(i18n);

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

  const [attendanceLogged, setAttendanceLogged] = useContext(attendanceContext);

  const { db, auth } = useContext(firebaseContext);
  const loggedIn = useContext(loggedInContext);

  const logAttendance = async () => {
    setAttendanceLogged(true);
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    addDoc(
      collection(db, 'people', auth.currentUser?.uid ?? '', 'attendance'),
      {
        date: date,
        garden: doc(db, 'gardens', garden ?? ''),
      }
    );
  };

  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  useEffect(() => {
    const effect = async () => {
      const attendanceCollection = await getDocs(
        collection(db, 'people', auth.currentUser?.uid ?? '', 'attendance')
      );
      const attendance: MarkedDates = {};
      attendanceCollection.forEach(doc => {
        const attendanceDoc = doc.data();
        attendance[
          // Date object pulled from the cloud is just JSON, so it doesn't have any methods.
          Object.assign(new Date(), attendanceDoc.date)
            .toISOString()
            .replace(/T.*$/, '')
        ] = {
          selected: true,
          selectedColor: '#7CFC00',
        };
      });

      setMarkedDates(attendance);
    };

    effect();
  }, []);

  useEffect(() => {
    setMarkedDates({
      [new Date().toISOString().replace(/T.*$/, '')]: {
        selected: true,
        selectedColor: '#7CFC00',
      },
      ...markedDates,
    });
  }, [attendanceLogged]);

  return (
    <View style={styles.centeredView}>
      {loggedIn ? (
        <>
          <Calendar
            markedDates={markedDates}
            theme={{ arrowColor: '#0101FF', todayTextColor: '#0101FF' }}
          />
          {!attendanceLogged && (
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
                <Button title={t('logAttendance')} onPress={logAttendance} />
              )}
            </>
          )}
        </>
      ) : (
        <>
          <Text>{t('signInWarning')}</Text>
          <Link href="/user" asChild>
            <Button title={t('goToUser')} />
          </Link>
        </>
      )}
    </View>
  );
}
