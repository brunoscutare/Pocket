import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

// A tab bar do iOS (NativeTabs "liquid glass") flutua por cima do conteúdo em vez de
// empurrá-lo pra cima — sem essa folga extra, o FAB fica embaixo dela. Android já reserva
// o espaço da TabBar sozinho, então basta a safe area.
const DEFAULT_BOTTOM = Platform.OS === 'ios' ? 76 : 20;

export function Fab({ onPress, icon = 'add', bottom = DEFAULT_BOTTOM }) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { bottom: bottom + insets.bottom, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Ionicons name={icon} size={28} color="#000" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
});
