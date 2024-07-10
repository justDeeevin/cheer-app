import { useState, useEffect, useContext } from 'react';
import { View, Text, Platform, ActivityIndicator, Button } from 'react-native';
import { firebaseContext } from '@/context';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential, User as FireUser } from 'firebase/auth';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import * as Apple from 'expo-apple-authentication'

import * as SecureStore from 'expo-secure-store';

import { User as UserInfo } from '@/types/firestore';

export default function User() {
  const { auth, db } = useContext(firebaseContext);
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [fireUser, setFireUser] = useState<FireUser | undefined>(auth.currentUser as FireUser);
  const [appleUser, setAppleUser] = useState<Apple.AppleAuthenticationCredential>();
  // const [error, setError] = useState<string>();

  useEffect(GoogleSignin.configure, []);

  useEffect(() => {
    const effect = async () => {
      if (fireUser) {
        let userInfo = (await getDoc(doc(db, 'people', fireUser.uid))).data() as UserInfo | undefined;
        if (!userInfo) {
          let lastName;
          let firstName;

          const googleUser = GoogleSignin.getCurrentUser();
          if (googleUser) {
            const googleUserInfo = googleUser.user;
            lastName = googleUserInfo?.familyName;
            firstName = googleUserInfo?.givenName;
          }
          else if (appleUser) {
            firstName = appleUser?.fullName?.givenName;
            lastName = appleUser?.fullName?.familyName;
          }

          userInfo = {
            "first name": firstName ? firstName : '',
            "last name": lastName ? lastName : ''
          }
          await setDoc(doc(db, 'people', fireUser.uid), userInfo);

        }

        setUserInfo(userInfo);
      }
    }
    effect()
  }, [fireUser])

  const signInGoogle = async () => {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();
    await SecureStore.setItemAsync('authProvider', 'Google');
    await SecureStore.setItemAsync('idToken', tokens.idToken ? tokens.idToken : '');
    await SecureStore.setItemAsync('accessToken', tokens.accessToken ? tokens.accessToken : '');
    const cred = GoogleAuthProvider.credential(tokens.idToken, tokens.accessToken);
    const res = await signInWithCredential(auth, cred);
    setFireUser(res.user);
  };

  const signInApple = async () => {
    const appleCred = await Apple.signInAsync({ requestedScopes: [Apple.AppleAuthenticationScope.EMAIL, Apple.AppleAuthenticationScope.FULL_NAME] });
    let idToken = appleCred.identityToken ? appleCred.identityToken : '';
    let accessToken = appleCred.authorizationCode ? appleCred.authorizationCode : '';
    await SecureStore.setItemAsync('authProvider', 'Apple');
    await SecureStore.setItemAsync('idToken', idToken);
    await SecureStore.setItemAsync('accessToken', accessToken);
    setAppleUser(appleCred);
    const firebaseCred = new OAuthProvider('apple.com')
      .credential({
        idToken,
        accessToken
      });
    const res = await signInWithCredential(auth, firebaseCred);
    setFireUser(res.user);
  }

  const signOut = async () => {
    await auth.signOut();
    setFireUser(undefined);
    setUserInfo(undefined);
    if ((await SecureStore.getItemAsync('authProvider')) === 'Google') {
      await GoogleSignin.signOut();
    }

    await SecureStore.deleteItemAsync('authProvider');
    await SecureStore.deleteItemAsync('idToken');
    await SecureStore.deleteItemAsync('accessToken');
  }

  return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    {userInfo && fireUser && <>
      <Text> Hello {`${userInfo["first name"]} ${userInfo["last name"]} <${fireUser.email}>`} </Text>
      <Button title="SIGN OUT" onPress={signOut} />
    </>}
    {fireUser && !userInfo && <ActivityIndicator />}
    {/*error && <Text> {error} </Text>*/}
    {!fireUser && <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={signInGoogle}
    />}
    {
      Platform.OS === 'ios' &&
      <Apple.AppleAuthenticationButton
        buttonType={Apple.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
        onPress={signInApple}
      />
    }
  </View >;
}
