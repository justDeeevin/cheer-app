import {
  GoogleSignin,
  GoogleSigninButton,
  User as GoogleUser,
  statusCodes
} from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';

export default function User() {
  const [userInfo, setUserInfo] = useState<GoogleUser>();
  const [error, setError] = useState<string>();

  useEffect(() => GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/drive']
  }), []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      setUserInfo(await GoogleSignin.signIn());
    } catch (e: any) {
      switch (e.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          setError('Sign in cancelled');
        case statusCodes.IN_PROGRESS:
          setError('Sign in in progress');
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          setError('Play services not available');
        default:
          setError(JSON.stringify(e));
      }
    }
  };

  const provider = new GoogleAuthProvider();

  return <ScrollView>
    {userInfo && <Text> Hello {userInfo.user.name} </Text>}
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={signIn}
    />
  </ScrollView>;
}
