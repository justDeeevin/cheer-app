import {
  GoogleSignin,
  GoogleSigninButton,
  User,
  statusCodes
} from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { View, Text } from 'react-native';

export default function User() {
  const [userInfo, setUserInfo] = useState<User>();

  GoogleSignin.configure();

  return <View>
    {userInfo !== undefined && <Text> Hello {userInfo.user.name} </Text>}
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={async () => {
        {
          try {
            await GoogleSignin.hasPlayServices();
            setUserInfo(await GoogleSignin.signIn());
          } catch (e: any) {
            switch (e.code) {
              case statusCodes.SIGN_IN_CANCELLED:
                break;
              case statusCodes.IN_PROGRESS:
                break;
              case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                break;
              default:
                break;
            }
          }
        }
      }}
    />
  </View>;
}
