import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export function Checkbox({ checked, onToggle, size = 24 }) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: checked ? colors.accent : 'transparent',
          borderColor: checked ? colors.accent : colors.cardBorder,
        },
      ]}
    >
      {checked ? <Ionicons name="checkmark" size={size * 0.7} color="#000" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
