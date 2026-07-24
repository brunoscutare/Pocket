import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const MOVIMENTACOES = [
  { titulo: 'Mercado', valor: '-R$ 120,00', data: 'Hoje' },
  { titulo: 'Salário', valor: '+R$ 3.200,00', data: 'Ontem' },
  { titulo: 'Internet', valor: '-R$ 99,90', data: '2 dias atrás' },
];

export default function MovimentacoesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Movimentações</Text>
        <Text style={styles.subtitle}>Últimas entradas e saídas</Text>
      </View>

      <View style={styles.listCard}>
        {MOVIMENTACOES.map((item, index) => {
          const positivo = item.valor.startsWith('+');
          return (
            <View key={index} style={styles.item}>
              <Ionicons
                name={positivo ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
                size={22}
                color={positivo ? '#00d26a' : colors.accent}
              />
              <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={styles.itemTitle}>{item.titulo}</Text>
                <Text style={styles.itemSubtitle}>{item.data}</Text>
              </View>
              <Text style={[styles.itemValor, { color: positivo ? '#00d26a' : colors.text }]}>{item.valor}</Text>
            </View>
          );
        })}
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
  itemValor: { fontSize: 15, fontWeight: '700' },
});
