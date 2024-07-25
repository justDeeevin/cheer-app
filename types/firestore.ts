import { DocumentReference, Timestamp } from 'firebase/firestore';

export interface User {
  firstName: string;
  lastName: string;
}

export interface Harvest {
  date: Timestamp;
  person: DocumentReference;
  garden: DocumentReference;
  crop: DocumentReference;
}

export interface Garden {
  houseNumber: string;
  streetName: string;
  nickname: string;
}

export interface Crop {
  ezID: string;
  name: {
    [locale: string]: { value: string };
  };
  units: {
    [locale: string]: { value: string };
  };
}
