import { DocumentReference } from "firebase/firestore";

export interface User {
  firstName: string;
  lastName: string;
}

export interface Harvest {
  date: Date;
  person: DocumentReference;
  garden: DocumentReference;
}

export interface Garden {
  houseNumber: string;
  streetName: string;
}
