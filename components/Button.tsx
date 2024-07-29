import { Pressable, Text } from 'react-native';

export default function Button({
  title,
  onPress,
  textSize = 20,
}: {
  title: string;
  onPress?: () => void | Promise<void>;
  textSize?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: '#0101FF',
        borderRadius: 4,
        padding: 8,
        margin: 4,
      }}
    >
      <Text style={{ fontSize: textSize, color: 'white' }}>{title}</Text>
    </Pressable>
  );
}
