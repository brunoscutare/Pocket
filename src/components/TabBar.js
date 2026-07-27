import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const TABS = [
  { name: 'index', icon: 'home-outline', iconActive: 'home', label: 'Início' },
  { name: 'pendencias', icon: 'time-outline', iconActive: 'time', label: 'Pendências' },
  { name: 'movimentacoes', icon: 'swap-horizontal-outline', iconActive: 'swap-horizontal', label: 'Movimentações' },
  { name: 'configuracoes', icon: 'settings-outline', iconActive: 'settings', label: 'Configurações' },
];

export function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) + 10 }]}>
      {state.routes.map((route, index) => {
        const tab = TABS.find((t) => t.name === route.name) || TABS[0];
        const on = state.index === index;
        return (
          <Pressable key={route.key} onPress={() => navigation.navigate(route.name)} style={styles.item}>
            <Ionicons name={on ? tab.iconActive : tab.icon} size={23} color={on ? colors.accent : colors.textMuted} />
            <Text style={[styles.label, { color: on ? colors.accent : colors.textMuted }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.bg,
  },
  item: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 2 },
  label: { fontSize: 10.5, letterSpacing: -0.1, fontWeight: '600' },
});
