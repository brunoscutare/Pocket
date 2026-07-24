import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>POCKET</Text>
          <Text style={styles.welcome}>Organize seu dia</Text>
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={22} color="#ff7a00" />
        </TouchableOpacity>
      </View>

      {/* Card Principal */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>TAREFAS DE HOJE</Text>

        <Text style={styles.balanceValue}>08</Text>

        <Text style={styles.balanceSubtitle}>
          5 concluídas • 3 pendentes
        </Text>
      </View>

      {/* Cards */}
      <View style={styles.row}>
        <View style={[styles.smallCard, { marginRight: 10 }]}>
          <Text style={styles.cardTitle}>CONCLUÍDAS</Text>

          <Text style={styles.cardValue}>25</Text>

          <View style={styles.circleGreen}>
            <Ionicons name="checkmark" size={20} color="#00d26a" />
          </View>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.cardTitle}>PENDENTES</Text>

          <Text style={styles.cardValue}>7</Text>

          <View style={styles.circleOrange}>
            <Ionicons name="time-outline" size={20} color="#ff7a00" />
          </View>
        </View>
      </View>

      {/* Progresso */}
      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>Progresso da Semana</Text>

        <View style={styles.fakeChart}>
          <View style={[styles.bar, { height: 40 }]} />
          <View style={[styles.bar, { height: 80 }]} />
          <View style={[styles.bar, { height: 55 }]} />
          <View style={[styles.bar, { height: 120 }]} />
          <View style={[styles.bar, { height: 95 }]} />
          <View style={[styles.bar, { height: 140 }]} />
          <View style={[styles.bar, { height: 110 }]} />
        </View>
      </View>

      {/* Últimas tarefas */}
      <View style={styles.listCard}>
        <Text style={styles.graphTitle}>Últimas tarefas</Text>

        {[
          "Comprar mercado",
          "Estudar React Native",
          "Pagar internet",
        ].map((item, index) => (
          <View key={index} style={styles.taskItem}>
            <Ionicons name="checkbox-outline" size={24} color="#ff7a00" />

            <View style={{ marginLeft: 15 }}>
              <Text style={styles.taskTitle}>{item}</Text>
              <Text style={styles.taskSubtitle}>Hoje</Text>
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const ORANGE = "#ff7a00";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
    paddingHorizontal: 18,
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    color: ORANGE,
    fontSize: 34,
    fontWeight: "900",
  },

  welcome: {
    color: "#888",
    marginTop: 4,
  },

  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },

  balanceCard: {
    backgroundColor: "#111",
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 18,
  },

  balanceTitle: {
    color: "#888",
    letterSpacing: 1,
    fontSize: 12,
  },

  balanceValue: {
    color: "#fff",
    fontSize: 46,
    fontWeight: "800",
    marginVertical: 8,
  },

  balanceSubtitle: {
    color: "#00d26a",
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    marginBottom: 18,
  },

  smallCard: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#222",
  },

  cardTitle: {
    color: "#888",
    fontSize: 11,
  },

  cardValue: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
    marginTop: 8,
  },

  circleGreen: {
    alignSelf: "flex-end",
    backgroundColor: "#0f261a",
    padding: 10,
    borderRadius: 12,
  },

  circleOrange: {
    alignSelf: "flex-end",
    backgroundColor: "#2d1b0b",
    padding: 10,
    borderRadius: 12,
  },

  graphCard: {
    backgroundColor: "#111",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#222",
  },

  graphTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  fakeChart: {
    height: 160,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  bar: {
    width: 22,
    backgroundColor: ORANGE,
    borderRadius: 10,
  },

  listCard: {
    backgroundColor: "#111",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 18,
  },

  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },

  taskTitle: {
    color: "#fff",
    fontSize: 17,
  },

  taskSubtitle: {
    color: "#777",
    marginTop: 3,
  },

  tipCard: {
    backgroundColor: "#241407",
    borderRadius: 24,
    padding: 22,
    marginBottom: 30,
  },

  tipTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },

  tipText: {
    color: "#ddd",
    marginVertical: 18,
    lineHeight: 24,
  },

  button: {
    backgroundColor: ORANGE,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});