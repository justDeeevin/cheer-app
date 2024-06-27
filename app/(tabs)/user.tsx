import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithCredential, User as GoogleUser } from 'firebase/auth';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes
} from '@react-native-google-signin/google-signin';
import { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { auth } from "@/firebaseConfig";

export default function User() {
  const [user, setUser] = useState<GoogleUser>();
  useEffect(GoogleSignin.configure, []);

  const provider = new GoogleAuthProvider();

  const signInEmail = async () => {
    const res = await signInWithEmailAndPassword(auth, 'devin.droddy@gmail.com', '123456');
    setUser(res.user);
  };

  const signInGoogle = async () => {
    await GoogleSignin.hasPlayServices();
    let user = await GoogleSignin.signIn();
    let cred = GoogleAuthProvider.credential(user.idToken);
    let res = await signInWithCredential(auth, cred);
    setUser(res.user);
  };

  return <View>
    {user && <Text> Hello {user.email} </Text>}
    <Button title="Sign in with email" onPress={signInEmail} />
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={signInGoogle}
    />
  </View>;
}
