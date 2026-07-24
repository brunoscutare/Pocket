import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const PENDENCIAS = [
  { titulo: 'Comprar mercado', prazo: 'Hoje' },
  { titulo: 'Pagar internet', prazo: 'Amanhã' },
  { titulo: 'Levar carro na revisão', prazo: 'Sexta-feira' },
];

export default function PendenciasScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Pendências</Text>
        <Text style={styles.subtitle}>{PENDENCIAS.length} tarefas aguardando</Text>
      </View>

      <View style={styles.listCard}>
        {PENDENCIAS.map((item, index) => (
          <View key={index} style={styles.item}>
            <Ionicons name="time-outline" size={22} color={colors.accent} />
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.itemTitle}>{item.titulo}</Text>
              <Text style={styles.itemSubtitle}>{item.prazo}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 18, paddingTop: 60 },
  header: { marginBottom: 24 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  subtitle: { color: colors.textMuted, marginTop: 4 },
  listCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  itemTitle: { color: colors.text, fontSize: 17 },
  itemSubtitle: { color: colors.textMuted, marginTop: 3 },
});
