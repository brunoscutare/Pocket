import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';

const OPCOES = [
  { icon: 'person-outline', label: 'Meus dados' },
  { icon: 'notifications-outline', label: 'Notificações' },
  { icon: 'shield-checkmark-outline', label: 'Segurança' },
  { icon: 'help-circle-outline', label: 'Ajuda' },
];

export default function PerfilScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={30} color={colors.accent} />
        </View>
        <View style={{ marginLeft: 16 }}>
          <Text style={styles.name}>Seu nome</Text>
          <Text style={styles.email}>voce@email.com</Text>
        </View>
      </View>

      <View style={styles.listCard}>
        {OPCOES.map((item, index) => (
          <TouchableOpacity key={index} style={styles.item}>
            <Ionicons name={item.icon} size={22} color={colors.accent} />
            <Text style={styles.itemTitle}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>SAIR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 18, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: colors.text, fontSize: 20, fontWeight: '700' },
  email: { color: colors.textMuted, marginTop: 4 },
  listCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  itemTitle: { color: colors.text, fontSize: 16, marginLeft: 15 },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: { color: colors.accent, fontWeight: '800', fontSize: 16 },
});
